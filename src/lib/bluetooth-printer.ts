/**
 * ChatChaska Web Bluetooth ESC/POS Thermal Printing Driver
 *
 * Connects directly to 58mm and 80mm portable Bluetooth thermal receipt printers
 * using the Web Bluetooth API (supported on Chrome Android & desktop browsers).
 */

export interface PrintReceiptOptions {
  restaurantName: string;
  billNumber: string;
  dateStr: string;
  tableNumber: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  paymentMode: string;
}

export class BluetoothThermalPrinter {
  private device: any = null;
  private characteristic: any = null;

  /**
   * Request Bluetooth device pair and connect to standard Serial Port / ESC-POS service.
   */
  async connect(): Promise<boolean> {
    if (typeof navigator === 'undefined' || !(navigator as any).bluetooth) {
      throw new Error('Web Bluetooth is not supported on this browser or platform.');
    }

    try {
      this.device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Standard ESC/POS service UUID
          'e7810a71-73ae-499d-8c15-faa9aef0c3f2', // Generic printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // ISSC Transparent
        ],
      });

      const server = await this.device.gatt.connect();
      const services = await server.getPrimaryServices();

      for (const service of services) {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            this.characteristic = char;
            return true;
          }
        }
      }

      return !!this.characteristic;
    } catch (error: any) {
      console.error('[Bluetooth Printer Error]:', error);
      throw error;
    }
  }

  /**
   * Check if Bluetooth printer is currently connected.
   */
  isConnected(): boolean {
    return !!this.characteristic;
  }

  /**
   * Generate raw ESC/POS command bytes for a restaurant receipt.
   */
  private generateEscPosBytes(data: PrintReceiptOptions): Uint8Array {
    const encoder = new TextEncoder();
    const parts: Uint8Array[] = [];

    const append = (str: string) => {
      parts.push(encoder.encode(str));
    };

    // ESC @: Initialize printer
    parts.push(new Uint8Array([0x1b, 0x40]));

    // Center Align
    parts.push(new Uint8Array([0x1b, 0x61, 0x01]));
    // Bold On
    parts.push(new Uint8Array([0x1b, 0x45, 0x01]));
    append(`${data.restaurantName}\n`);
    // Bold Off
    parts.push(new Uint8Array([0x1b, 0x45, 0x00]));
    append(`Tax Invoice / Bill Receipt\n`);
    append(`--------------------------------\n`);

    // Left Align
    parts.push(new Uint8Array([0x1b, 0x61, 0x00]));
    append(`Bill #${data.billNumber} | Table: ${data.tableNumber}\n`);
    append(`Date: ${data.dateStr}\n`);
    append(`--------------------------------\n`);
    append(`Item                 Qty   Amount\n`);
    append(`--------------------------------\n`);

    data.items.forEach((item) => {
      const name = item.name.padEnd(20, ' ').slice(0, 20);
      const qty = `x${item.quantity}`.padStart(4, ' ');
      const amt = (item.quantity * item.price).toFixed(2).padStart(8, ' ');
      append(`${name} ${qty} ${amt}\n`);
    });

    append(`--------------------------------\n`);
    // Right Align
    parts.push(new Uint8Array([0x1b, 0x61, 0x02]));
    append(`Subtotal: Rs.${data.subtotal.toFixed(2)}\n`);
    if (data.cgst > 0) append(`CGST: Rs.${data.cgst.toFixed(2)}\n`);
    if (data.sgst > 0) append(`SGST: Rs.${data.sgst.toFixed(2)}\n`);

    // Bold On
    parts.push(new Uint8Array([0x1b, 0x45, 0x01]));
    append(`GRAND TOTAL: Rs.${data.grandTotal.toFixed(2)}\n`);
    parts.push(new Uint8Array([0x1b, 0x45, 0x00]));
    append(`Payment: ${data.paymentMode.toUpperCase()}\n`);

    // Center Align
    parts.push(new Uint8Array([0x1b, 0x61, 0x01]));
    append(`--------------------------------\n`);
    append(`Thank You! Visit Again!\n`);
    append(`Powered by ChatChaska POS\n\n\n\n`);

    // Paper Cut (GS V 0)
    parts.push(new Uint8Array([0x1d, 0x56, 0x00]));

    // Combine all chunks into single Uint8Array
    const totalLength = parts.reduce((acc, p) => acc + p.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const p of parts) {
      combined.set(p, offset);
      offset += p.length;
    }

    return combined;
  }

  /**
   * Print formatted receipt to Bluetooth printer.
   */
  async printReceipt(data: PrintReceiptOptions): Promise<void> {
    if (!this.characteristic) {
      const connected = await this.connect();
      if (!connected) throw new Error('Could not establish Bluetooth connection to printer.');
    }

    const payload = this.generateEscPosBytes(data);
    const CHUNK_SIZE = 512;

    for (let i = 0; i < payload.length; i += CHUNK_SIZE) {
      const chunk = payload.slice(i, i + CHUNK_SIZE);
      if (this.characteristic.writeValueWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
    }
  }
}

export const bluetoothPrinter = new BluetoothThermalPrinter();

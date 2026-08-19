import { Bill } from '@/types';

export function generateTallySalesVouchersXML(bills: Bill[]): string {
  const vouchersXML = bills
    .map(
      (b) => `
    <VOUCHER VCHTYPE="Sales" ACTION="Create">
      <DATE>${b.createdAt?.split('T')[0]?.replace(/-/g, '') || '20260812'}</DATE>
      <VOUCHERTYPENAME>Sales</VOUCHERTYPENAME>
      <VOUCHERNUMBER>${b.id}</VOUCHERNUMBER>
      <PARTYLEDGERNAME>${b.paymentMode.toUpperCase()} Collection</PARTYLEDGERNAME>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>Restaurant Food Sales</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${b.subtotal - b.discountAmount}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>CGST Payable (2.5%)</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${b.cgstAmount || 0}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>SGST Payable (2.5%)</LEDGERNAME>
        <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
        <AMOUNT>-${b.sgstAmount || 0}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
      <ALLLEDGERENTRIES.LIST>
        <LEDGERNAME>${b.paymentMode.toUpperCase()} Account</LEDGERNAME>
        <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
        <AMOUNT>${b.grandTotal}</AMOUNT>
      </ALLLEDGERENTRIES.LIST>
    </VOUCHER>`
    )
    .join('\n');

  return `<?xml version="1.0"?>
<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
        <STATICVARIABLES>
          <SVCURRENTCOMPANY>Spice Garden Restaurant</SVCURRENTCOMPANY>
        </STATICVARIABLES>
      </REQUESTDESC>
      <REQUESTDATA>
        ${vouchersXML}
      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>`;
}

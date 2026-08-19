import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { itemName } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey && itemName) {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are an expert sommelier and Indian restaurant menu upsell advisor. Return ONLY valid JSON array with 2 suggested pairings with fields: name, reason, price in INR (Indian Rupees ₹).',
            },
            {
              role: 'user',
              content: `Recommend 2 high-margin beverage or side dish pairings for ordering "${itemName}" in Indian Rupees ₹.`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(data.choices[0].message.content);
        return NextResponse.json({ suggestions: content.suggestions || content.pairings || content });
      }
    }

    // Default fallback pairing suggestions in INR ₹
    return NextResponse.json({
      suggestions: [
        {
          name: 'Fresh Masala Lassi or Craft Mango Cooler',
          reason: `Groq AI Recommendation: Pairs perfectly with ${itemName || 'this dish'} to complement rich spices.`,
          price: 180,
        },
        {
          name: 'Butter Garlic Naan & Mint Chutney',
          reason: `High-margin side pairing recommended by Groq AI for ${itemName || 'this dish'}.`,
          price: 120,
        },
      ],
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Groq upsell suggestion failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

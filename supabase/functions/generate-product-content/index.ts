import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { productName, insuranceType, shortSummary } = await req.json();

    if (!productName || !insuranceType) {
      return new Response(
        JSON.stringify({ error: "Product name and insurance type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate AI content using a simple template-based approach
    // In production, you would integrate with OpenAI API or similar
    const description = generateDescription(productName, insuranceType, shortSummary);
    const marketingCopy = generateMarketingCopy(productName, insuranceType);
    const exclusions = generateExclusions(insuranceType);
    const faq = generateFAQ(productName, insuranceType);

    return new Response(
      JSON.stringify({
        description,
        marketingCopy,
        exclusions,
        faq,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating content:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function generateDescription(
  productName: string,
  insuranceType: string,
  shortSummary?: string
): string {
  const baseDescription = shortSummary || `Comprehensive ${insuranceType} insurance coverage`;

  const templates = {
    health: `${productName} provides comprehensive health insurance coverage designed to protect you and your family. Our ${insuranceType} insurance offers extensive medical coverage including hospitalisation, outpatient care, specialist consultations, and preventive health check-ups. With ${productName}, you can enjoy peace of mind knowing that your healthcare needs are taken care of with minimal out-of-pocket expenses.`,

    auto: `${productName} delivers complete protection for your vehicle with our ${insuranceType} insurance. Whether it's damage from accidents, theft, or natural disasters, we've got you covered. Our policy includes comprehensive coverage, third-party liability, and additional benefits like roadside assistance and no-claims bonus protection.`,

    life: `${productName} offers reliable life insurance protection to secure your family's financial future. Our ${insuranceType} policy provides a lump sum payment to your beneficiaries, helping them maintain their lifestyle and meet financial obligations. With flexible premium options and comprehensive coverage, you can ensure your loved ones are protected.`,

    home: `${productName} provides comprehensive protection for your home and belongings. Our ${insuranceType} insurance covers structural damage, personal possessions, and liability protection. From fire and flood damage to theft and accidental damage, we ensure your most valuable asset is fully protected.`,

    travel: `${productName} ensures you're protected on your travels with comprehensive ${insuranceType} insurance. Our coverage includes medical emergencies abroad, trip cancellation, lost baggage, and flight delays. Travel with confidence knowing you're covered for unexpected events wherever you go.`,

    business: `${productName} offers tailored ${insuranceType} insurance solutions for your business needs. Protect your company against various risks including property damage, liability claims, and business interruption. Our comprehensive coverage helps ensure your business can continue operating smoothly even when faced with unexpected challenges.`,

    pet: `${productName} provides comprehensive ${insuranceType} insurance to keep your furry friends healthy and happy. Our coverage includes veterinary fees, emergency treatment, and ongoing care. With ${productName}, you can ensure your pets receive the best medical care without worrying about the costs.`,

    other: `${productName} offers specialised ${insuranceType} insurance coverage tailored to your unique needs. ${baseDescription}. Our comprehensive policy provides extensive protection and peace of mind.`,
  };

  return templates[insuranceType as keyof typeof templates] || templates.other;
}

function generateMarketingCopy(productName: string, insuranceType: string): string {
  const templates = {
    health: `Get the healthcare protection you deserve with ${productName}! Enjoy cashless hospitalisation, extensive network of hospitals, and comprehensive coverage for the whole family. Sign up today and protect what matters most.`,

    auto: `Drive with confidence knowing ${productName} has you covered! Comprehensive protection, quick claims settlement, and 24/7 roadside assistance. Get your quote in minutes and start saving today!`,

    life: `Secure your family's future with ${productName}. Affordable premiums, flexible coverage options, and guaranteed payouts. Because those who depend on you deserve financial security.`,

    home: `Your home is your castle – protect it with ${productName}! Complete coverage for your property and belongings, plus liability protection. Get instant coverage and enjoy peace of mind.`,

    travel: `Travel fearlessly with ${productName}! Comprehensive coverage for medical emergencies, trip cancellations, and lost baggage. Wherever you go, we've got your back. Get covered in minutes!`,

    business: `Protect your business investment with ${productName}! Comprehensive coverage tailored to your industry needs. From property to liability, we've got you covered. Get a quote today!`,

    pet: `Give your pets the care they deserve with ${productName}! Comprehensive coverage for accidents, illnesses, and routine care. Because your pet is family. Get started today!`,

    other: `Experience complete protection with ${productName}! Tailored coverage designed specifically for your needs. Join thousands of satisfied customers today!`,
  };

  return templates[insuranceType as keyof typeof templates] || templates.other;
}

function generateExclusions(insuranceType: string): string[] {
  const commonExclusions = [
    "Pre-existing conditions not declared at the time of application",
    "Claims arising from war, terrorism, or civil unrest",
    "Fraudulent or dishonest acts",
    "Intentional self-injury or suicide",
  ];

  const typeSpecificExclusions: Record<string, string[]> = {
    health: [
      ...commonExclusions,
      "Cosmetic or aesthetic treatments",
      "Experimental or investigational treatments",
      "Dental treatment unless arising from an accident",
      "Routine health check-ups beyond the annual limit",
    ],
    auto: [
      ...commonExclusions,
      "Driving under the influence of alcohol or drugs",
      "Using the vehicle for commercial purposes without disclosure",
      "Damage to tyres unless the vehicle is also damaged",
      "Mechanical or electrical breakdown",
    ],
    life: [
      ...commonExclusions,
      "Death within the first two years from suicide",
      "Death arising from participation in hazardous activities not disclosed",
      "Claims where premiums are in arrears",
    ],
    home: [
      ...commonExclusions,
      "Wear and tear or gradual deterioration",
      "Damage by domestic pets",
      "Damage occurring while the property is unoccupied for more than 30 days",
      "Flood damage if the property is in a high-risk flood zone",
    ],
    travel: [
      ...commonExclusions,
      "Travel to countries with travel warnings",
      "Claims arising from extreme sports unless specifically covered",
      "Trip cancellations due to change of mind",
      "Loss of items left unattended in public places",
    ],
    business: [
      ...commonExclusions,
      "Losses arising from regulatory or legal changes",
      "Cyber attacks unless specifically covered",
      "Employee dishonesty unless specifically covered",
      "Professional indemnity claims unless specifically covered",
    ],
    pet: [
      ...commonExclusions,
      "Breeding-related conditions",
      "Cosmetic procedures",
      "Behavioural issues or training",
      "Routine vaccinations and preventive care",
    ],
  };

  return typeSpecificExclusions[insuranceType] || commonExclusions;
}

function generateFAQ(productName: string, insuranceType: string): Array<{
  question: string;
  answer: string;
}> {
  const commonFAQs = [
    {
      question: "How do I make a claim?",
      answer: `To make a claim under ${productName}, simply log into your account, navigate to the claims section, and submit your claim details along with supporting documents. Our team will review and process your claim within 7-14 business days.`,
    },
    {
      question: "Can I cancel my policy?",
      answer: "Yes, you can cancel your policy at any time. If you cancel within 14 days of purchase (cooling-off period), you'll receive a full refund. After this period, you may be entitled to a pro-rata refund depending on the policy terms.",
    },
    {
      question: "How are premiums calculated?",
      answer: "Premiums are calculated based on various factors including your age, coverage amount, location, and risk factors specific to the type of insurance. We use advanced algorithms to ensure fair and competitive pricing.",
    },
  ];

  const typeSpecificFAQs: Record<string, Array<{ question: string; answer: string }>> = {
    health: [
      ...commonFAQs,
      {
        question: "What is cashless hospitalisation?",
        answer: "Cashless hospitalisation allows you to receive treatment at network hospitals without paying upfront. Simply present your insurance card, and we'll settle the bills directly with the hospital.",
      },
      {
        question: "Are pre-existing conditions covered?",
        answer: "Pre-existing conditions are typically covered after a waiting period of 2-4 years, depending on the condition and as per policy terms. Please refer to your policy document for specific details.",
      },
    ],
    auto: [
      ...commonFAQs,
      {
        question: "What is No-Claims Bonus (NCB)?",
        answer: "No-Claims Bonus is a discount on your premium for every claim-free year. The discount can accumulate up to 50% over several years of claim-free driving.",
      },
      {
        question: "Does the policy cover natural calamities?",
        answer: "Yes, comprehensive auto insurance covers damage from natural calamities such as floods, earthquakes, storms, and landslides.",
      },
    ],
    life: [
      ...commonFAQs,
      {
        question: "Who can be a beneficiary?",
        answer: "You can nominate anyone as a beneficiary - spouse, children, parents, or any other person. You can also have multiple beneficiaries and specify the percentage each should receive.",
      },
      {
        question: "What happens if I miss a premium payment?",
        answer: "Most policies have a grace period of 30 days for premium payment. If you miss this period, your policy may lapse. However, many policies offer revival options within a certain period.",
      },
    ],
    home: [
      ...commonFAQs,
      {
        question: "What's the difference between buildings and contents cover?",
        answer: "Buildings cover protects the structure of your home, while contents cover protects your personal belongings inside. You can choose to have both or either one depending on your needs.",
      },
      {
        question: "Is accidental damage covered?",
        answer: "Accidental damage can be added as an optional cover. This protects against unexpected damage to your home or contents that isn't covered under standard policy.",
      },
    ],
    travel: [
      ...commonFAQs,
      {
        question: "Does the policy cover COVID-19?",
        answer: "Coverage for COVID-19 varies by policy. Many policies now include coverage for medical expenses related to COVID-19. Please check your specific policy terms for details.",
      },
      {
        question: "What if my trip is cancelled?",
        answer: "Trip cancellation coverage reimburses you for non-refundable expenses if you need to cancel your trip for covered reasons such as illness, injury, or family emergencies.",
      },
    ],
    business: [
      ...commonFAQs,
      {
        question: "What is business interruption coverage?",
        answer: "Business interruption coverage compensates for lost income and ongoing expenses if your business is temporarily unable to operate due to a covered event like fire or natural disaster.",
      },
      {
        question: "Do I need employers' liability insurance?",
        answer: "If you have employees, employers' liability insurance is typically a legal requirement. It covers compensation claims from employees who suffer injury or illness as a result of their work.",
      },
    ],
    pet: [
      ...commonFAQs,
      {
        question: "What age can I insure my pet from?",
        answer: "Most pet insurance policies allow you to insure your pet from 8 weeks old. Some policies have upper age limits for new policies, typically around 8-10 years depending on the pet type.",
      },
      {
        question: "Are routine check-ups covered?",
        answer: "Basic policies typically don't cover routine check-ups and vaccinations. However, you can add wellness coverage as an optional extra to include routine preventive care.",
      },
    ],
  };

  return typeSpecificFAQs[insuranceType] || commonFAQs;
}

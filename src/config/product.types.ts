export type PricingTier = {
  id: string;
  name: string;
  monthlyPrice: number;
  currency: string;
  stripePriceId: string;
  features: string[];
  highlighted?: boolean;
};

export type Feature = {
  title: string;
  body: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

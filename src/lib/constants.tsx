// Lovable store templates configuration
export const templates = {
  fashion: {
    name: "Fashion Elite",
    colors: {
      primary: "222 47% 11%",
      secondary: "0 0% 98%",
      accent: "47 100% 52%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-sans"
    },
    layout: "grid" as const,
    cardStyle: "elegant" as const
  },
  tech: {
    name: "Tech Modern",
    colors: {
      primary: "213 94% 22%",
      secondary: "210 40% 96%",
      accent: "217 91% 60%"
    },
    fonts: {
      heading: "font-bold",
      body: "font-sans"
    },
    layout: "grid" as const,
    cardStyle: "modern" as const
  },
  minimal: {
    name: "Minimal Clean",
    colors: {
      primary: "0 0% 9%",
      secondary: "0 0% 96%",
      accent: "0 0% 45%"
    },
    fonts: {
      heading: "font-light",
      body: "font-sans"
    },
    layout: "list" as const,
    cardStyle: "soft" as const
  }
};

export type TemplateConfig = typeof templates.fashion;

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]

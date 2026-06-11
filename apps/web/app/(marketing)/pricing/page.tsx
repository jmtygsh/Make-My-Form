import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Free",
    description: "Perfect for trying out our form builder.",
    price: "$0",
    features: ["Up to 3 forms", "100 responses/month", "Basic templates", "Standard support"],
    cta: "Get Started",
    href: "/registration",
    popular: false,
  },
  {
    name: "Pro",
    description: "For professionals and growing businesses.",
    price: "$15",
    features: ["Unlimited forms", "5,000 responses/month", "Premium templates", "Priority support", "Custom branding", "Data export"],
    cta: "Upgrade to Pro",
    href: "/registration",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "Advanced features for large teams.",
    price: "$49",
    features: ["Unlimited everything", "Custom domain", "Team collaboration", "Dedicated account manager", "API access", "SSO integration"],
    cta: "Contact Sales",
    href: "/contact",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="container py-24 lg:py-32 mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-xl text-muted-foreground">
          Choose the perfect plan for your form building needs. No hidden fees.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={`flex flex-col ${plan.popular ? "border-primary shadow-lg scale-105 relative" : ""}`}>
            {plan.popular && (
              <Badge className="absolute top-3 left-1/2 -translate-x-1/2" variant="default">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" variant={plan.popular ? "default" : "outline"}>
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}

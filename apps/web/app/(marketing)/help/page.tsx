import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Input } from "~/components/ui/input";
import { Search, Book, MessageCircle, FileText } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

const faqs = [
  {
    question: "How do I create my first form?",
    answer: "Getting started is easy! Simply log in to your dashboard, click the 'Create Form' button, and choose whether to start from scratch or use one of our templates. Our drag-and-drop builder will guide you through the rest.",
  },
  {
    question: "Can I embed forms on my own website?",
    answer: "Yes, absolutely! Once you've published your form, you'll receive a snippet of HTML code that you can copy and paste directly into your website's code. It works seamlessly with WordPress, Shopify, Wix, and custom sites.",
  },
  {
    question: "What happens when I reach my response limit?",
    answer: "If you're on a Free or Pro plan and approach your response limit, we'll send you an email notification. You can continue to receive responses, but you'll need to upgrade your plan to view the excess data.",
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. All data is encrypted both in transit and at rest using industry-standard protocols. We are also GDPR compliant and offer features like data deletion and export.",
  },
  {
    question: "Can I customize the look of my forms?",
    answer: "Yes! You can customize colors, fonts, and button styles to match your brand. Pro and Enterprise users can even remove our branding and use a custom domain for their forms.",
  },
];

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics of creating and sharing forms.",
    icon: <Book className="h-6 w-6 text-primary" />,
    href: "/guides",
  },
  {
    title: "Contact Support",
    description: "Need help? Get in touch with our team.",
    icon: <MessageCircle className="h-6 w-6 text-primary" />,
    href: "/contact",
  },
  {
    title: "API Documentation",
    description: "Integrate our forms with your own applications.",
    icon: <FileText className="h-6 w-6 text-primary" />,
    href: "#",
  },
];

export default function HelpCenterPage() {
  return (
    <div className="container py-16 lg:py-24 mx-auto">
      {/* Hero Section */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-6">
          How can we help you?
        </h1>
        <div className="relative max-w-xl mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search for articles, guides, or FAQs..." 
            className="pl-10 h-12 text-lg rounded-full"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 max-w-5xl mx-auto">
        {categories.map((category) => (
          <Link key={category.title} href={category.href}>
            <Card className="h-full hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <div className="mb-4 bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                  {category.icon}
                </div>
                <CardTitle>{category.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {category.description}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* FAQs */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left text-lg font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground text-base leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}

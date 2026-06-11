import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { ArrowRight, PlayCircle, Settings, Share2, LayoutTemplate } from "lucide-react";
import Link from "next/link";

const guides = [
  {
    title: "Getting Started with Form Builder",
    description: "Learn the basics of creating your first form, adding fields, and saving your work.",
    icon: <PlayCircle className="h-8 w-8 text-blue-500" />,
    readTime: "5 min read",
    href: "#",
  },
  {
    title: "Customizing Form Templates",
    description: "Discover how to use and modify pre-built templates to match your brand's look and feel.",
    icon: <LayoutTemplate className="h-8 w-8 text-green-500" />,
    readTime: "8 min read",
    href: "#",
  },
  {
    title: "Advanced Field Settings",
    description: "Master conditional logic, validation rules, and custom error messages for your inputs.",
    icon: <Settings className="h-8 w-8 text-orange-500" />,
    readTime: "12 min read",
    href: "#",
  },
  {
    title: "Sharing and Embedding",
    description: "Learn how to share your forms via URL or embed them directly into your own website.",
    icon: <Share2 className="h-8 w-8 text-purple-500" />,
    readTime: "6 min read",
    href: "#",
  },
];

export default function HowToGuidesPage() {
  return (
    <div className="container py-16 lg:py-24 mx-auto max-w-5xl">
      <div className="mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">How-to Guides</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Step-by-step tutorials to help you master every feature of our form builder platform.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {guides.map((guide, index) => (
          <Card key={index} className="flex flex-col h-full hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start gap-4 space-y-0">
              <div className="bg-muted p-3 rounded-xl">
                {guide.icon}
              </div>
              <div>
                <CardTitle className="text-xl mb-2">{guide.title}</CardTitle>
                <CardDescription className="text-base">
                  {guide.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="mt-auto pt-6 flex items-center justify-between">
              <span className="text-sm text-muted-foreground font-medium">
                {guide.readTime}
              </span>
              <Button variant="ghost" className="group" asChild>
                <Link href={guide.href}>
                  Read guide 
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-20 bg-primary/5 rounded-2xl p-8 text-center border border-primary/10">
        <h2 className="text-2xl font-bold mb-4">Can't find what you're looking for?</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
          Our support team is always ready to help you with any specific questions or custom implementations.
        </p>
        <Button size="lg" asChild>
          <Link href="/contact">Contact Support</Link>
        </Button>
      </div>
    </div>
  );
}

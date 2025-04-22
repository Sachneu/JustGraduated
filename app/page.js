// app/page.js (Server Component)
import { auth } from '@clerk/nextjs/server'; // Updated import
import HeroSection from "@/components/ui/hero";
import { features } from "@/data/features";
import { Card, CardContent } from "@/components/ui/card";

import Image from "next/image";
import { Accordion, AccordionContent, AccordionTrigger } from "@/components/ui/accordion";
import { AccordionItem } from "@radix-ui/react-accordion";

import GetStarted from "@/components/GetStarted";
import ClientSection from "./client-section";
import { testimonials } from '@/data/testimonials';
import { faqs } from '@/data/faqs';

export default async function Home() {
  const { userId } = await auth(); // Fetch userId server-side
  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Powerful Features to Jumpstart Your Career
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to optimize your resume, prep for interviews, and land your dream job.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center border border-border shadow-sm hover:shadow-md transition-all">
                <CardContent className="flex flex-col items-center justify-center space-y-3">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            What Our Users Say
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hear from professionals who used JustGraduated to land their dream jobs.
          </p>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mt-10">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 shadow-lg border border-border hover:shadow-xl">
                <CardContent className="flex flex-col items-center text-center space-y-4">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={80}
                    height={80}
                    className="rounded-full border-2 border-primary"
                  />
                  <h3 className="text-lg font-semibold text-foreground">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground italic">"{testimonial.feedback}"</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{testimonial.role}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-30x bg-background">
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Got questions? We have answers!
          </p>
          <div className="mt-10 space-y-6 text-left">
            <Accordion type="single" collapsible>
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-300 dark:border-gray-700">
                  <AccordionItem value={`faq-${index}`}>
                    <AccordionTrigger className="cursor-pointer">{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                </div>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Pass userId to ClientSection */}
      <GetStarted />
      <ClientSection userId={userId} />
    </div>
  );
}
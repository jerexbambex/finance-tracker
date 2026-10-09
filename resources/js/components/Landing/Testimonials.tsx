import { usePage } from '@inertiajs/react';

interface Testimonial {
    name: string;
    content: string;
    rating: number;
}

export default function Testimonials() {
    const { testimonials = [] } = usePage<{ testimonials?: Testimonial[] }>().props;

    // Only real, approved testimonials are shown; with none yet, the section stays out of the page.
    if (testimonials.length === 0) {
        return null;
    }

    return (
        <section id="testimonials" className="scroll-mt-16 border-b border-border bg-muted/40">
            <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
                <h2 className="font-display text-3xl leading-tight font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                    From people who use it
                </h2>

                <div className="mt-12 grid gap-10 md:grid-cols-3 md:gap-0 md:divide-x md:divide-border">
                    {testimonials.map((testimonial, index) => (
                        <figure key={`${testimonial.name}-${index}`} className="md:px-8 md:first:pl-0 md:last:pr-0">
                            <blockquote className="text-lg leading-relaxed text-pretty text-foreground">“{testimonial.content}”</blockquote>
                            <figcaption className="mt-5 text-sm text-muted-foreground">
                                {testimonial.name}
                                <span className="sr-only">, rated {testimonial.rating} out of 5</span>
                            </figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}

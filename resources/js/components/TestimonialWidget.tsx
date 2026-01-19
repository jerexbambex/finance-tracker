import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Star, Trash2 } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Testimonial {
    id: string;
    content: string;
    rating: number;
    is_approved: boolean;
    created_at: string;
}

interface Props {
    testimonials: Testimonial[];
}

export default function TestimonialWidget({ testimonials }: Props) {
    const [showForm, setShowForm] = useState(false);
    
    const { data, setData, post, processing, reset, errors } = useForm({
        content: '',
        rating: 5,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/testimonials', {
            onSuccess: () => {
                reset();
                setShowForm(false);
            },
        });
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to delete this testimonial?')) {
            router.delete(`/testimonials/${id}`);
        }
    };

    return (
        <Card className="border-border/40">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Share Your Experience</CardTitle>
                        <CardDescription>Help others by sharing your feedback</CardDescription>
                    </div>
                    {!showForm && testimonials.length === 0 && (
                        <Button onClick={() => setShowForm(true)} size="sm">
                            Write Testimonial
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {showForm ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Your Rating</Label>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setData('rating', star)}
                                        className="focus:outline-none"
                                    >
                                        <Star
                                            className={`h-6 w-6 ${
                                                star <= data.rating
                                                    ? 'fill-yellow-500 text-yellow-500'
                                                    : 'text-muted-foreground'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="content">Your Testimonial</Label>
                            <Textarea
                                id="content"
                                value={data.content}
                                onChange={(e) => setData('content', e.target.value)}
                                placeholder="Share your experience with Budget App..."
                                rows={4}
                                maxLength={500}
                                className={errors.content ? 'border-red-500' : ''}
                            />
                            {errors.content && (
                                <p className="text-sm text-red-500">{errors.content}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                {data.content.length}/500 characters
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <Button type="submit" disabled={processing}>
                                Submit Testimonial
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setShowForm(false);
                                    reset();
                                }}
                            >
                                Cancel
                            </Button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-3">
                        {testimonials.length > 0 ? (
                            testimonials.map((testimonial) => (
                                <div
                                    key={testimonial.id}
                                    className="rounded-lg border border-border/40 p-4 space-y-2"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-1">
                                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                                />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                variant={testimonial.is_approved ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {testimonial.is_approved ? 'Approved' : 'Pending Review'}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleDelete(testimonial.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{testimonial.content}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(testimonial.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-muted-foreground mb-4">
                                    You haven't shared a testimonial yet
                                </p>
                                <Button onClick={() => setShowForm(true)} size="sm">
                                    Write Your First Testimonial
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

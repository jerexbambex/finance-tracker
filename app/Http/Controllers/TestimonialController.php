<?php

namespace App\Http\Controllers;

use App\Models\Testimonial;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'content' => 'required|string|max:500',
            'rating' => 'required|integer|min:1|max:5',
        ]);

        $testimonial = $request->user()->testimonials()->create([
            'content' => $validated['content'],
            'rating' => $validated['rating'],
            'is_approved' => false,
        ]);

        return back()->with('success', 'Thank you for your testimonial! It will be reviewed by our team.');
    }

    public function destroy(Testimonial $testimonial)
    {
        $this->authorize('delete', $testimonial);

        $testimonial->delete();

        return back()->with('success', 'Testimonial deleted successfully.');
    }
}

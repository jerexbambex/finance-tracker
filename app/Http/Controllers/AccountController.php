<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function dataManagement()
    {
        return Inertia::render('account/data-management');
    }

    public function importData(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json|max:10240', // 10MB max
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        if (! $data || ! isset($data['exported_at'])) {
            return back()->withErrors(['file' => 'Invalid backup file format.']);
        }

        $user = auth()->user();

        // Import data - simple append strategy
        // Note: This creates new records rather than updating existing ones
        // Duplicate detection would require matching on unique fields (name, date, amount, etc.)

        if (isset($data['accounts'])) {
            foreach ($data['accounts'] as $account) {
                unset($account['id'], $account['user_id'], $account['created_at'], $account['updated_at']);
                $user->accounts()->create($account);
            }
        }

        if (isset($data['categories'])) {
            foreach ($data['categories'] as $category) {
                unset($category['id'], $category['user_id'], $category['created_at'], $category['updated_at']);
                $user->categories()->create($category);
            }
        }

        return redirect()->route('account.data-management')->with('success', 'Data imported successfully!');
    }
}

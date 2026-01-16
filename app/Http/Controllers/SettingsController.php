<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/Index');
    }

    public function importData(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:json|max:10240', // 10MB max
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        if (!$data || !isset($data['exported_at'])) {
            return back()->withErrors(['file' => 'Invalid backup file format.']);
        }

        $user = auth()->user();

        // Import data (this is a simple append, not a replace)
        // In production, you'd want more sophisticated merge logic
        
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

        return redirect()->route('settings.index')->with('success', 'Data imported successfully!');
    }
}

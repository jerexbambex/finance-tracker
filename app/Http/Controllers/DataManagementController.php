<?php

namespace App\Http\Controllers;

use App\Services\BackupRestorer;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class DataManagementController extends Controller
{
    public function index()
    {
        return Inertia::render('settings/data-management');
    }

    public function import(Request $request, BackupRestorer $restorer)
    {
        $request->validate([
            'file' => 'required|file|mimes:json|max:51200', // 50MB max
        ]);

        $json = file_get_contents($request->file('file')->getRealPath());
        $data = json_decode($json, true);

        if (! is_array($data) || ! isset($data['exported_at'])) {
            return back()->withErrors(['file' => 'Invalid backup file format.']);
        }

        $counts = $restorer->restore($request->user(), $data);

        $restored = collect($counts)
            ->map(fn (int $count, string $section) => $count.' '.Str::plural(Str::singular(str_replace('_', ' ', $section)), $count))
            ->join(', ', ' and ');

        return redirect()->route('settings.data-management')->with(
            'success',
            $restored === '' ? 'Nothing new to restore. Everything in this backup is already here.' : "Restored {$restored}.",
        );
    }
}

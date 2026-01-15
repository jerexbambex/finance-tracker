<?php

namespace App\Http\Controllers;

use App\Models\Transaction;
use App\Models\Account;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function index()
    {
        $accounts = auth()->user()->accounts()->where('is_active', true)->get();
        
        return Inertia::render('import/Index', [
            'accounts' => $accounts,
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt',
            'account_id' => 'required|exists:accounts,id',
        ]);

        $account = Account::where('id', $request->account_id)
            ->where('user_id', auth()->id())
            ->firstOrFail();

        $file = $request->file('file');
        $handle = fopen($file->getRealPath(), 'r');
        
        $header = fgetcsv($handle);
        $imported = 0;
        $errors = [];

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < 4) continue;

            $data = [
                'date' => $row[0] ?? null,
                'description' => $row[1] ?? null,
                'amount' => $row[2] ?? null,
                'type' => $row[3] ?? null,
                'category' => $row[4] ?? null,
            ];

            $validator = Validator::make($data, [
                'date' => 'required|date',
                'description' => 'required|string',
                'amount' => 'required|numeric',
                'type' => 'required|in:income,expense',
            ]);

            if ($validator->fails()) {
                $errors[] = "Row skipped: " . implode(', ', $validator->errors()->all());
                continue;
            }

            $category = null;
            if (!empty($data['category'])) {
                $category = Category::firstOrCreate(
                    ['name' => $data['category'], 'user_id' => auth()->id()],
                    ['type' => $data['type'], 'is_active' => true]
                );
            }

            Transaction::create([
                'user_id' => auth()->id(),
                'account_id' => $account->id,
                'category_id' => $category?->id,
                'type' => $data['type'],
                'amount' => abs($data['amount']) * 100,
                'description' => $data['description'],
                'transaction_date' => $data['date'],
            ]);

            $imported++;
        }

        fclose($handle);

        return back()->with('success', "Imported {$imported} transactions" . 
            (count($errors) > 0 ? " with " . count($errors) . " errors" : ""));
    }
}

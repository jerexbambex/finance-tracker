<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Response;
use App\Models\Transaction;
use App\Models\Account;
use App\Models\Budget;
use App\Models\Goal;
use App\Models\Category;
use App\Exports\TransactionsExport;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function exportTransactions(Request $request)
    {
        return Excel::download(new TransactionsExport, 'transactions_' . now()->format('Y-m-d') . '.xlsx');
    }

    public function exportAll(Request $request)
    {
        $user = auth()->user();
        
        $data = [
            'exported_at' => now()->toIso8601String(),
            'accounts' => Account::where('user_id', $user->id)->get(),
            'categories' => Category::where('user_id', $user->id)->get(),
            'transactions' => Transaction::where('user_id', $user->id)->get(),
            'budgets' => Budget::where('user_id', $user->id)->get(),
            'goals' => Goal::where('user_id', $user->id)->get(),
        ];

        return Response::json($data)
            ->header('Content-Type', 'application/json')
            ->header('Content-Disposition', 'attachment; filename="budget_backup_' . now()->format('Y-m-d') . '.json"');
    }
}

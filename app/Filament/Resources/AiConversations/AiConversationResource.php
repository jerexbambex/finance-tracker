<?php

namespace App\Filament\Resources\AiConversations;

use App\Filament\Resources\AiConversations\Pages\CreateAiConversation;
use App\Filament\Resources\AiConversations\Pages\EditAiConversation;
use App\Filament\Resources\AiConversations\Pages\ListAiConversations;
use App\Filament\Resources\AiConversations\Schemas\AiConversationForm;
use App\Filament\Resources\AiConversations\Tables\AiConversationsTable;
use App\Models\AiConversation;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class AiConversationResource extends Resource
{
    protected static ?string $model = AiConversation::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function form(Schema $schema): Schema
    {
        return AiConversationForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return AiConversationsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAiConversations::route('/'),
            'create' => CreateAiConversation::route('/create'),
            'edit' => EditAiConversation::route('/{record}/edit'),
        ];
    }
}

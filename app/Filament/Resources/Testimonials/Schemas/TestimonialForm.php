<?php

namespace App\Filament\Resources\Testimonials\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class TestimonialForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'name')
                    ->required()
                    ->searchable()
                    ->preload(),
                
                Textarea::make('content')
                    ->required()
                    ->rows(4)
                    ->maxLength(500)
                    ->columnSpanFull(),
                
                Select::make('rating')
                    ->options([
                        1 => '1 Star',
                        2 => '2 Stars',
                        3 => '3 Stars',
                        4 => '4 Stars',
                        5 => '5 Stars',
                    ])
                    ->default(5)
                    ->required(),
                
                Toggle::make('is_approved')
                    ->label('Approved')
                    ->default(false),
                
                Toggle::make('is_featured')
                    ->label('Featured on Homepage')
                    ->default(false),
            ]);
    }
}

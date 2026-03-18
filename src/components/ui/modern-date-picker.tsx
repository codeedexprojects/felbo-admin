'use client';

import * as React from 'react';
import { addDays, startOfMonth } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RotateCcw } from 'lucide-react';

interface ModernDatePickerProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
}

export function ModernDatePicker({ selected, onSelect }: ModernDatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState<Date>(
    selected ? startOfMonth(selected) : startOfMonth(new Date())
  );

  const presets = [
    {
      label: 'Today',
      value: 0,
      color:
        'text-blue-600 bg-blue-50/50 border-blue-100 hover:bg-blue-600 hover:text-white active:scale-95',
    },
    {
      label: 'Yesterday',
      value: -1,
      color:
        'text-amber-600 bg-amber-50/50 border-amber-100 hover:bg-amber-600 hover:text-white active:scale-95',
    },
    {
      label: 'Last Week',
      value: -7,
      color:
        'text-purple-600 bg-purple-50/50 border-purple-100 hover:bg-purple-600 hover:text-white active:scale-95',
    },
    {
      label: 'Last Month',
      value: -30,
      color:
        'text-emerald-600 bg-emerald-50/50 border-emerald-100 hover:bg-emerald-600 hover:text-white active:scale-95',
    },
  ];

  return (
    <Card className="border-0 shadow-2xl overflow-hidden bg-card/95 backdrop-blur-md ring-1 ring-border/50">
      <CardContent className="p-0 border-b border-border/40">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={onSelect}
          month={currentMonth}
          onMonthChange={setCurrentMonth}
          fixedWeeks
          className="p-4 [[data-slot=calendar]]:w-full [--cell-size:2.5rem]"
          showOutsideDays={false}
        />
      </CardContent>
      <div className="p-3 bg-muted/10">
        <p className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-3 ml-1">
          Quick Presets
        </p>
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => (
            <Button
              key={preset.value}
              variant="outline"
              size="sm"
              className={`h-9 text-[11px] font-bold border transition-all duration-300 shadow-sm ${preset.color}`}
              onClick={() => {
                const newDate = addDays(new Date(), preset.value);
                onSelect(newDate);
                setCurrentMonth(startOfMonth(newDate));
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4 h-9 text-[11px] font-bold text-red-500 hover:bg-red-500 hover:text-white border border-transparent hover:border-red-100 flex items-center justify-center gap-2 transition-all duration-300 rounded-lg group"
          onClick={() => onSelect(undefined)}
        >
          <RotateCcw className="h-3 w-3 group-hover:rotate-180 transition-transform duration-500" />
          Clear Selection
        </Button>
      </div>
    </Card>
  );
}

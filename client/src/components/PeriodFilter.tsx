import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";

export type PeriodType = 'current_month' | 'specific_month' | 'quarter' | 'semester' | 'year';

export interface PeriodFilter {
  type: PeriodType;
  year?: number;
  month?: number;
  quarter?: number;
  semester?: number;
}

interface PeriodFilterProps {
  value: PeriodFilter;
  onChange: (filter: PeriodFilter) => void;
}

export function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  const handleTypeChange = (type: PeriodType) => {
    const newFilter: PeriodFilter = { type };
    
    if (type === 'specific_month') {
      newFilter.year = currentYear;
      newFilter.month = new Date().getMonth() + 1;
    } else if (type === 'quarter') {
      newFilter.year = currentYear;
      newFilter.quarter = Math.ceil((new Date().getMonth() + 1) / 3);
    } else if (type === 'semester') {
      newFilter.year = currentYear;
      newFilter.semester = new Date().getMonth() < 6 ? 1 : 2;
    } else if (type === 'year') {
      newFilter.year = currentYear;
    }
    
    onChange(newFilter);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar className="h-4 w-4" />
        <span>Período:</span>
      </div>
      
      <Select value={value.type} onValueChange={handleTypeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current_month">Mês Atual</SelectItem>
          <SelectItem value="specific_month">Mês Específico</SelectItem>
          <SelectItem value="quarter">Trimestre</SelectItem>
          <SelectItem value="semester">Semestre</SelectItem>
          <SelectItem value="year">Ano</SelectItem>
        </SelectContent>
      </Select>

      {value.type === 'specific_month' && (
        <>
          <Select 
            value={value.month?.toString()} 
            onValueChange={(m) => onChange({ ...value, month: parseInt(m) })}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(m => (
                <SelectItem key={m.value} value={m.value.toString()}>
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select 
            value={value.year?.toString()} 
            onValueChange={(y) => onChange({ ...value, year: parseInt(y) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {value.type === 'quarter' && (
        <>
          <Select 
            value={value.quarter?.toString()} 
            onValueChange={(q) => onChange({ ...value, quarter: parseInt(q) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Q1</SelectItem>
              <SelectItem value="2">Q2</SelectItem>
              <SelectItem value="3">Q3</SelectItem>
              <SelectItem value="4">Q4</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={value.year?.toString()} 
            onValueChange={(y) => onChange({ ...value, year: parseInt(y) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {value.type === 'semester' && (
        <>
          <Select 
            value={value.semester?.toString()} 
            onValueChange={(s) => onChange({ ...value, semester: parseInt(s) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">S1</SelectItem>
              <SelectItem value="2">S2</SelectItem>
            </SelectContent>
          </Select>
          
          <Select 
            value={value.year?.toString()} 
            onValueChange={(y) => onChange({ ...value, year: parseInt(y) })}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map(y => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </>
      )}

      {value.type === 'year' && (
        <Select 
          value={value.year?.toString()} 
          onValueChange={(y) => onChange({ ...value, year: parseInt(y) })}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(y => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

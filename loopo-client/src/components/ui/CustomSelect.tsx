'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  description?: string;
}

interface CustomSelectProps {
  label?: string;
  options: (string | SelectOption)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function CustomSelect({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  disabled = false,
  className = '',
  id: customId,
}: CustomSelectProps) {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Normalize options array into SelectOption objects
  const normalizedOptions: SelectOption[] = options.map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return opt;
  });

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      const idx = normalizedOptions.findIndex((opt) => opt.value === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value]);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (isOpen) {
          if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
            onChange(normalizedOptions[highlightedIndex].value);
            setIsOpen(false);
          }
        } else {
          setIsOpen(true);
        }
        break;

      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev < normalizedOptions.length - 1 ? prev + 1 : 0));
        }
        break;

      case 'ArrowUp':
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : normalizedOptions.length - 1));
        }
        break;

      case 'Escape':
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`space-y-1 relative ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-bold text-slate-700 block mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        ref={triggerRef}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        className={`w-full flex items-center justify-between bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-2xl px-4 py-3 text-xs font-semibold text-slate-800 outline-none transition-all duration-150 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        } ${isOpen ? 'ring-2 ring-emerald-500/30 border-emerald-500 bg-white' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span className={selectedOption ? 'text-slate-900 font-extrabold' : 'text-slate-400 font-medium'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-600' : ''
          }`}
        />
      </button>

      {/* Accessible Listbox Dropdown Overlay */}
      {isOpen && (
        <ul
          id={listboxId}
          role="listbox"
          tabIndex={-1}
          aria-activedescendant={
            highlightedIndex >= 0 ? `${selectId}-option-${highlightedIndex}` : undefined
          }
          className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-100 rounded-2xl shadow-xl py-1.5 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 space-y-0.5"
        >
          {normalizedOptions.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIndex;
            const OptionIcon = option.icon;

            return (
              <li
                key={option.value}
                id={`${selectId}-option-${idx}`}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                  triggerRef.current?.focus();
                }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-3.5 py-2.5 mx-1 rounded-xl text-xs font-semibold flex items-center justify-between cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold'
                    : isHighlighted
                    ? 'bg-slate-50 text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {OptionIcon && (
                    <OptionIcon
                      className={`w-4 h-4 shrink-0 ${
                        isSelected ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    />
                  )}
                  <div className="truncate">
                    <div>{option.label}</div>
                    {option.description && (
                      <div className="text-[10px] font-normal text-slate-400 truncate">
                        {option.description}
                      </div>
                    )}
                  </div>
                </div>

                {isSelected && <Check className="w-4 h-4 text-emerald-600 shrink-0 ml-2" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Country } from "@/lib/types/country";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";


export const CountrySelect = () => {
  const { setValue } = useFormContext();
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,flag,cca2,idd,currencies"
        );

        if (!response.ok) throw new Error("Failed to fetch countries");

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error("Invalid response");

        const formatted: Country[] = data
          .filter((c) => c.name?.common && c.cca2 && c.flag && c.idd?.root)
          .map((c) => ({
            name: c.name.common,
            flag: c.flag,
            code: c.cca2,
            dial_code: c.idd.root + (c.idd.suffixes?.[0] || ""),
            currency: Object.keys(c.currencies || {})[0] || "",
            currencySymbol: c.currencies
              ? Object.values(c.currencies)[0]?.symbol || ""
              : "",
          }))
          .sort((a, b) => a.name.localeCompare(b.name));

        setCountries(formatted);
      } catch (error) {
        console.error("Country fetch failed:", error);
      }
    };

    fetchCountries();
  }, []);

  const handleSelect = (code: string) => {
    const selected = countries.find((c) => c.code === code);
    if (!selected) return;

    setSelectedCode(code);
    setValue("country", selected.name);
    setValue("countryCode", selected.code);
    setValue("dialCode", selected.dial_code);
    setValue("flag", selected.flag);
    setValue("currency", selected.currency);
    setValue("currencySymbol", selected.currencySymbol);
    setOpen(false);
  };

  const selectedCountry = countries.find((c) => c.code === selectedCode);

  return (
    <div className="w-full space-y-2">
      <Label htmlFor="country">Select Country</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
          >
            {selectedCountry ? (
              <span>
                {selectedCountry.flag} {selectedCountry.name} (
                {selectedCountry.dial_code})
              </span>
            ) : (
              <span className="text-muted-foreground">Choose a country</span>
            )}
            <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0 max-h-72 overflow-y-auto">
          <Command>
            <CommandInput placeholder="Search country..." className="h-9" />
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (
                <CommandItem
                  key={c.code}
                  value={c.name}
                  onSelect={() => handleSelect(c.code)}
                  className="flex items-center justify-between"
                >
                  <div>
                    {c.flag} {c.name} ({c.dial_code})
                  </div>
                  {selectedCode === c.code && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

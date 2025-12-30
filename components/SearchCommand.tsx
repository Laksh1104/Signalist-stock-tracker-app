"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { CommandDialog, CommandEmpty, CommandInput, CommandList } from "@/components/ui/command"
import {Button} from "@/components/ui/button";
import {Loader2, Star, TrendingUp} from "lucide-react";
import Link from "next/link";
import {searchStocks} from "@/lib/actions/finnhub.actions";
import {useDebounce} from "@/hooks/useDebounce";
import {addToWatchlist, removeFromWatchlist} from "@/lib/actions/watchlist.actions";
import {toast} from "sonner";

export default function SearchCommand({ renderAs = 'button', label = 'Add stock', initialStocks }: SearchCommandProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [stocks, setStocks] = useState<StockWithWatchlistStatus[]>(initialStocks);
  const router = useRouter();
  const pathname = usePathname();
  const isSearchMode = !!searchTerm.trim();
  
  // Deduplicate stocks by symbol to prevent React key conflicts
  const uniqueStocks = stocks?.filter((stock, index, self) => 
    index === self.findIndex(s => s.symbol === stock.symbol)
  );
  const displayStocks = isSearchMode ? uniqueStocks : uniqueStocks?.slice(0, 10);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(v => !v)
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    // Refetch stocks when dialog opens to get current watchlist status
    const fetchFreshStocks = async () => {
      if (open && !searchTerm.trim()) {
        try {
          const results = await searchStocks('');
          setStocks(results);
        } catch {
          setStocks(initialStocks);
        }
      }
    };
    fetchFreshStocks();
  }, [open]);

  const handleSearch = async () => {
    if(!isSearchMode) return setStocks(initialStocks);

    setLoading(true)
    try {
      const results = await searchStocks(searchTerm.trim());
      setStocks(results);
    } catch {
      setStocks([])
    } finally {
      setLoading(false)
    }
  }

  const debouncedSearch = useDebounce(handleSearch, 300);

  useEffect(() => {
    debouncedSearch();
  }, [searchTerm, debouncedSearch]);

  const handleSelectStock = () => {
    setOpen(false);
    setSearchTerm("");
    setStocks(initialStocks);
  }

  // Handle watchlist toggle
  const handleToggleWatchlist = async (e: React.MouseEvent, stock: StockWithWatchlistStatus) => {
    e.preventDefault();
    e.stopPropagation();

    const isAdding = !stock.isInWatchlist;

    // Optimistic update
    setStocks(prev => prev.map(s =>
        s.symbol === stock.symbol ? { ...s, isInWatchlist: isAdding } : s
    ));

    try {
      if (isAdding) {
        await addToWatchlist(stock.symbol, stock.name);
        toast.success(`${stock.symbol} added to watchlist`);
      } else {
        await removeFromWatchlist(stock.symbol);
        toast.success(`${stock.symbol} removed from watchlist`);
      }
      if (pathname === '/watchlist') {
        router.refresh();
      }
    } catch (error) {
      // Revert on error
      setStocks(prev => prev.map(s =>
          s.symbol === stock.symbol ? { ...s, isInWatchlist: !isAdding } : s
      ));
      toast.error("Failed to update watchlist");
    }
  };

  return (
      <>
        {renderAs === 'text' ? (
            <span onClick={() => setOpen(true)} className="search-text">
            {label}
          </span>
        ): (
            <Button onClick={() => setOpen(true)} className="search-btn">
              {label}
            </Button>
        )}
        <CommandDialog open={open} onOpenChange={setOpen} className="search-dialog">
          <div className="search-field">
            <CommandInput value={searchTerm} onValueChange={setSearchTerm} placeholder="Search stocks..." className="search-input" />
            {loading && <Loader2 className="search-loader" />}
          </div>
          <CommandList className="search-list">
            {loading ? (
                <CommandEmpty className="search-list-empty">Loading stocks...</CommandEmpty>
            ) : displayStocks?.length === 0 ? (
                <div className="search-list-indicator">
                  {isSearchMode ? 'No results found' : 'No stocks available'}
                </div>
            ) : (
                <ul>
                  <div className="search-count">
                    {isSearchMode ? 'Search results' : 'Popular stocks'}
                    {` `}({displayStocks?.length || 0})
                  </div>
                  {displayStocks?.map((stock, i) => (
                      <li key={stock.symbol} className="search-item flex">
                        <Link
                            href={`/stocks/${stock.symbol}`}
                            onClick={handleSelectStock}
                            className="search-item-link"
                        >
                          <TrendingUp className="h-4 w-4 text-gray-500" />
                          <div  className="flex-1">
                            <div className="search-item-name">
                              {stock.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {stock.symbol} | {stock.exchange } | {stock.type}
                            </div>
                          </div>
                        </Link>
                          <button
                              type="button"
                              className="watchlist-icon-btn"
                              onClick={(e) => handleToggleWatchlist(e, stock)}
                              title={stock.isInWatchlist ? `Remove ${stock.symbol} from watchlist` : `Add ${stock.symbol} to watchlist`}
                          >
                            <Star
                                className={`h-5 w-5 transition-colors ${
                                    stock.isInWatchlist
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-400"
                                }`}
                            />
                          </button>
                      </li>
                  ))}
                </ul>
            )
            }
          </CommandList>
        </CommandDialog>
      </>
  )
}
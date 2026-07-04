import { useEffect, useRef, useState } from 'react';
import { Subject, from, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  map,
  switchMap,
  tap,
  catchError
} from 'rxjs/operators';
import { fetchEvents } from '../services/api';
import type { EventItem } from '../types';

const MIN_LENGTH = 2;

export function useEventSearchStream() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const term$ = useRef(new Subject<string>()).current;

  useEffect(() => {
    const subscription = term$
      .pipe(
        map((value) => value.trim()),
        debounceTime(300),
        distinctUntilChanged(),
        tap((value) => setLoading(value.length >= MIN_LENGTH)),
        switchMap((value) => {
          if (value.length < MIN_LENGTH) return of<EventItem[]>([]);
          return from(fetchEvents({ search: value })).pipe(catchError(() => of<EventItem[]>([])));
        })
      )
      .subscribe((events) => {
        setResults(events);
        setLoading(false);
      });

    return () => subscription.unsubscribe();
  }, [term$]);

  const search = (value: string) => {
    setTerm(value);
    term$.next(value);
  };

  const clear = () => {
    setTerm('');
    setResults([]);
    setLoading(false);
    term$.next('');
  };

  return { term, results, loading, search, clear };
}

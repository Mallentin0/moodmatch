import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { analyzePrompt } from "./claude.ts";
import { fetchMovieDetails, searchMovies, buildSearchUrl, searchMoviesByTitle, type MovieResult } from "./tmdb.ts";
import { enrichWithOMDbData } from "./omdb.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    let allResults = [];
    const words = prompt.trim().split(/\s+/);
    const isLikeDislikePrompt = prompt.toLowerCase().includes('similar to') || prompt.toLowerCase().includes('different from');

    // Generate random page numbers for each API call
    const randomPages = Array.from({ length: 5 }, () => Math.floor(Math.random() * 20) + 1);
    console.log('Using random pages:', randomPages);

    if (words.length === 1 || words.length > 3 || isLikeDislikePrompt) {
      console.log('Searching by title/keyword:', prompt);
      // Search across multiple random pages
      for (const page of randomPages.slice(0, 2)) {
        const titleResults = await searchMoviesByTitle(prompt, page);
        allResults.push(...titleResults);
      }
    } else {
      console.log('Using Claude for analysis of complex prompt');
      const searchParams = await analyzePrompt(prompt);
      console.log('Parsed search parameters:', searchParams);
      
      // Search across multiple random pages with different sort options
      for (const page of randomPages) {
        const searchUrl = buildSearchUrl(searchParams, page);
        console.log(`TMDB URL for page ${page}:`, searchUrl);
        
        const searchData = await searchMovies(searchUrl);
        
        if (searchData.results && Array.isArray(searchData.results)) {
          allResults.push(...searchData.results);
        }
      }
    }

    if (allResults.length === 0) {
      console.log('No results found, trying broader search...');
      const fallbackUrl = buildSearchUrl({}, Math.floor(Math.random() * 20) + 1);
      const fallbackData = await searchMovies(fallbackUrl);
      allResults.push(...fallbackData.results);
    }

    // Shuffle results and take a random subset
    const shuffledResults = allResults
      .filter((movie, index, self) => 
        index === self.findIndex((m) => m.id === movie.id)
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const movies: MovieResult[] = await Promise.all(
      shuffledResults.map(async (movie: any) => {
        console.log('Processing movie:', movie.title);
        const details = await fetchMovieDetails(movie.id);
        
        const baseMovie = {
          title: movie.title,
          year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
          poster: movie.poster_path 
            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
            : 'https://via.placeholder.com/500x750?text=No+Poster',
          synopsis: movie.overview || 'No synopsis available',
          genre: details.genres?.map((g: any) => g.name) || [],
          type: 'movie'
        };

        return await enrichWithOMDbData(baseMovie);
      })
    );

    console.log('Final movies response:', movies);

    return new Response(
      JSON.stringify({ movies }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in search-movies function:', error);
    
    try {
      // Use a random page for fallback results
      const randomPage = Math.floor(Math.random() * 20) + 1;
      const fallbackUrl = buildSearchUrl({}, randomPage);
      const fallbackData = await searchMovies(fallbackUrl);
      
      const movies = await Promise.all(
        fallbackData.results
          .sort(() => Math.random() - 0.5)
          .slice(0, 6)
          .map(async (movie: any) => {
            const baseMovie = {
              title: movie.title,
              year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
              poster: movie.poster_path 
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : 'https://via.placeholder.com/500x750?text=No+Poster',
              synopsis: movie.overview || 'No synopsis available',
              type: 'movie'
            };
            return await enrichWithOMDbData(baseMovie);
          })
      );

      return new Response(
        JSON.stringify({ movies }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (fallbackError) {
      return new Response(
        JSON.stringify({ error: 'Failed to get movie recommendations' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  }
});
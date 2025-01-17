const TMDB_API_KEY = Deno.env.get('TMDB_API_KEY');

export interface MovieResult {
  title: string;
  year: string;
  poster: string;
  synopsis: string;
  streaming?: string[];
  genre?: string[];
  tone?: string[];
  theme?: string[];
  type?: 'movie';
}

export async function fetchMovieDetails(movieId: number): Promise<any> {
  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&append_to_response=watch/providers`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  return response.json();
}

export async function searchMovies(searchUrl: string): Promise<any> {
  const response = await fetch(searchUrl);
  return response.json();
}

export async function searchMoviesByTitle(query: string): Promise<any[]> {
  const response = await fetch(
    `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=en-US&page=1&include_adult=false`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  const data = await response.json();
  return data.results || [];
}

export function buildSearchUrl(params: any, page: number): string {
  const sortOptions = ['popularity.desc', 'vote_average.desc', 'revenue.desc'];
  const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
  
  let searchUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&sort_by=${randomSort}&include_adult=false&page=${page}`;
  
  if (params.genre) {
    searchUrl += `&with_genres=${encodeURIComponent(params.genre)}`;
  }
  
  if (params.year) {
    const year = params.year.toString();
    if (year.length === 4) {
      searchUrl += `&primary_release_year=${year}`;
    } else if (year.length === 2) {
      const startYear = `19${year}`;
      searchUrl += `&primary_release_date.gte=${startYear}-01-01&primary_release_date.lte=${parseInt(startYear) + 9}-12-31`;
    }
  }
  
  if (params.keywords && params.keywords.length > 0) {
    searchUrl += `&with_keywords=${encodeURIComponent(params.keywords.join(','))}`;
  }

  return searchUrl;
}
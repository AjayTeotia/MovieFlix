export const TMDB_CONFIG = {
    BASE_URL: "https://api.themoviedb.org/3",
    API_KEY: process.env.EXPO_PUBLIC_MOVIE_API_KEY,
    headers: {
        accept: "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_MOVIE_API_KEY}`,
    }
}

export const fetchMovies = async ({
    query,
    resultsPerPage = 50,  // Default to 50 results per query
}: {
    query: string;
    resultsPerPage?: number;  // Allow flexibility in how many results per query
}): Promise<Movie[]> => {
    // Calculate the number of pages to fetch based on the requested results per page
    const totalPages = Math.ceil(resultsPerPage / 20);  // Each page has 20 results by default

    const allResults: Movie[] = [];

    // Fetch results from each page
    for (let page = 1; page <= totalPages; page++) {
        const endpoint = query
            ? `${TMDB_CONFIG.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${page}`
            : `${TMDB_CONFIG.BASE_URL}/discover/movie?sort_by=popularity.desc&include_adult=false&page=${page}`;

        const response = await fetch(endpoint, {
            method: "GET",
            headers: TMDB_CONFIG.headers,
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch movies: ${response.statusText}`);
        }

        const data = await response.json();
        allResults.push(...data.results);  // Collect results from each page
    }

    return allResults;
};

export const fetchMovieDetails = async (
    movieId: string
): Promise<MovieDetails> => {
    try {
        const response = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/${movieId}?api_key=${TMDB_CONFIG.API_KEY}`,
            {
                method: "GET",
                headers: TMDB_CONFIG.headers,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch movie details: ${response.statusText}`);
        }

        const data = await response.json();

        // Fetch movie trailers
        const videoResponse = await fetch(
            `${TMDB_CONFIG.BASE_URL}/movie/${movieId}/videos?api_key=${TMDB_CONFIG.API_KEY}`,
            {
                method: "GET",
                headers: TMDB_CONFIG.headers,
            }
        );

        if (!videoResponse.ok) {
            throw new Error(`Failed to fetch videos: ${videoResponse.statusText}`);
        }

        const videoData = await videoResponse.json();
        const trailer = videoData.results.find((video: any) => video.type === "Trailer");

        // Return movie details along with trailer URL if available
        return { ...data, trailerUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null };
    } catch (error) {
        console.error("Error fetching movie details:", error);
        throw error;
    }
};

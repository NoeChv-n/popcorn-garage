const API_KEY = 'b652cc10b72d6096298ef9b5b87f3953'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500'; 

export async function getMoviePoster(movieTitle) {
  try {
    const response = await fetch(
      `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(movieTitle)}&language=fr-FR`
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // On retourne l'URL complète de l'affiche du premier résultat
      return `${IMAGE_URL}${data.results[0].poster_path}`;
    }
    return null;
  } catch (error) {
    console.error("Erreur API TMDB :", error);
    return null;
  }
}
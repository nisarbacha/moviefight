 const autCompleteConfig = {
   renderOption(movie) {
     const imgSrc = movie.Poster === "N/A" ? '' : movie.Poster;
     return `
       <img src="${imgSrc}"/>
       ${movie.Title} (${movie.Year})
       `;
   },
   
   inputValue(movie) {
     return movie.Title;
   },
   async fetchData(searchTerm) {
     const response = await axios.get('http://www.omdbapi.com/', {
       params: {
         apikey: '3f3c6873',
         s: searchTerm
       }
     });
     if (response.data.Error) {
       return [];
     }
     return response.data.Search;
   }
 }
createAutoComplete({
  ...autCompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },

});
createAutoComplete({
  ...autCompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden')
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },

})
let leftMovie;
let rightMovie;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: '3f3c6873',
      i: movie.imdbID
    }
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  if(side === 'left'){
    leftMovie = response.data;
  }
  else{
    rightMovie = response.data;
  }
  if(leftMovie && rightMovie){
    runComparison();
  }
};
const runComparison = () => {
   const leftSideStats = document.querySelectorAll('#left-summary .notification');
  const rightSideStates = document.querySelectorAll('#right-summary .notification');
    leftSideStats.forEach((leftStat, index) =>{
    const rightStat = rightSideStates[index];
      const leftSideValue = parseInt(leftStat.dataset.value);
      const rightSideValue = parseInt(rightStat.dataset.value);
      if (rightSideValue > leftSideValue){
        leftStat.classList.remove('is-primary');
        leftStat.classList.add('is-warning');
      } else {
        rightStat.classList.remove('is-primary');
        rightStat.classList.add('is-warning');
      } 
    })
}
const movieTemplate = (movieDetails) => {
  const { Poster, Title, Genre, Plot, Awards, BoxOffice, Metascore, imdbRating, imdbVotes } = movieDetails;
  const awards = Awards.split('').reduce((prev, word)=>{
    const value = parseInt(word);
    if(isNaN(value)){return prev;}
    else{return prev + value}
  }, 0)
  const dollars = parseInt(BoxOffice.replace(/\$/g,'').replace(/,/g, ''));
  const metascore = parseInt(Metascore);
  const imdbrating = parseFloat(imdbRating);
  const imdbvotes = parseInt(imdbVotes.replace(/,/g, '')); 
  return `
          <article class='media'>
              <figure class='media-left'>
                <p class='image'>
                  <img src='${Poster}'/>
                </p>
              </figure>
            <div class='media-content'>
              <div class='content'>
                <h1>${Title}</h1>
                <h4>${Genre}</h4>
                <p>  ${Plot} </p>
              </div>
            </div>
          </article>
          <article data-value=${awards} class='notification is-primary'>
              <p class='title'>${Awards}</p> 
                <p class='subtitle'>Award</p>
          </article>
           <article data-value=${dollars}  class='notification is-primary'>
              <p class='title'>${BoxOffice}</p>
                <p class='subtitle'>BoxOffice</p>
          </article>
           <article data-value=${metascore}  class='notification is-primary'>
              <p class='title'>${Metascore}</p>
                <p class='subtitle'>Metascore</p>
          </article>
           <article data-value=${imdbrating}  class='notification is-primary'>
              <p class='title'>${imdbRating}</p>
                <p class='subtitle'>imdbRating</p>
          </article>
  <article data-value=${imdbvotes} class='notification is-primary'>
              <p class='title'>${imdbVotes}</p>
                <p class='subtitle'>imdbVotes</p>
          </article>
  `
}



document.addEventListener('DOMContentLoaded', function() {
  fetch(`../locales/${lang}.json`)

    .then(response => response.json())
    .then(data => {
      let posts = data.posts;
      let params = new URLSearchParams(window.location.search);
      let post_name = params.get('name');
      let post_id;
      let post;
      let found = false;
      for (var i = 0; i < posts.length; i++) {
        if (posts[i].title.toLowerCase() == post_name) {
          post = posts[i];
          post_id = parseInt(posts[i].id);
          found = true;
          break;
        }
      }
      if (found) {
        document.title = post.title;
        document.querySelector('section.site-hero.inner-page.overlay').style.setProperty('background-image', `url('../images/${post.main_image}')`);
        const intro = document.querySelector('section.blog-intro');
        intro.querySelector('h3').innerText = post.title;
        intro.querySelector('span > span').innerText = post.tag;

        const blogArticle = document.querySelector('section.blog-article');
        blogArticle.querySelector('h4').innerText = post.title;
        let index = 0;
        blogArticle.querySelectorAll('h6').forEach((item) => {
          item.innerText = post.headings[index];
          ++index;
        });
        index = 0;
        blogArticle.querySelectorAll('p').forEach((item) => {
          item.innerText = post.paragraphs[index];
          ++index;
        });
        index = 0;
        blogArticle.querySelectorAll('img').forEach((item) => {
          item.src = '../images/' + post.images[index];
          ++index;
        });

        document.querySelector('section.bg-image.overlay').style.setProperty('background-image', `url('../images/${post.main_image}')`);
      } else {
        window.open('404.html', '_self');
      }
      let postIds = [];
      const max = posts.length-1;
      const getUniqueRandom = (ids) =>{
        let num;
        do {
          num = Math.floor(Math.random() * max);
        } while (ids.includes(num) || num === post_id - 1);
        return num;
      }
      for(let i = 0; i < 2; i++) {
        postIds.push(getUniqueRandom(postIds));
      }
      const blogItemFeature = document.querySelector('section.blog-item-feature');
      let index = 0;
      blogItemFeature.querySelectorAll('.blog-item').forEach((item) => {
        const id = postIds[index];
        item.querySelector('span').innerText = posts[id].tag;
        item.querySelector('h5 > a').innerText = posts[id].title;
        item.querySelector('img').src = '../images/' + posts[id].main_image;
        item.querySelectorAll('a').forEach((link) => {
          link.setAttribute('href', 'post.html?name=' + posts[id].title.toLowerCase());
        });
        ++index;
      });
    });
});

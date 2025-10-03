let posts_cache = [];
let initialized = false;
let current_page = 1;
const posts_per_page = 6;
const post_body = (index, post, isLazy = false) => `
  <div class="col-lg-4 col-md-6 col-sm-6 col-12 post mb-5" 
       data-aos="fade-up" data-aos-delay="${index * 100}">
    <div class="media media-custom d-block mb-4 h-100">
      <a href="${"../"+lang+"/post.html?name=" + post.title.toLowerCase()}" class="mb-4 d-block post-link">
        <img 
          src="../images/${post.main_image}" 
          srcset="../images/${post.main_image.replace('.webp','-480.webp')} 480w,
                  ../images/${post.main_image.replace('.webp','-768.webp')} 768w,
                  ../images/${post.main_image} 1200w"
          sizes="(max-width: 600px) 480px,
                 (max-width: 900px) 768px,
                 1200px"
          alt="${post.title}" 
          class="img-fluid" 
          ${isLazy ? 'loading="lazy"' : ''}>
      </a>
      <div class="media-body">
        <span class="meta-post">${post.tag}</span>
        <h2 class="mt-0 mb-3">
          <a href="${"../"+lang+"/post.html?name=" + post.title.toLowerCase()}" class="post-link">${post.title}</a>
        </h2>
        <p>${post.paragraphs[0]}</p>
      </div>
    </div>
  </div>
`;

function build_page_indicators(posts_count, per_page) {
  const total_pages = Math.ceil(posts_count / per_page);
  const container = document.getElementById("page_indicator");

  for (let i = 1; i <= total_pages; i++) {
    const li = document.createElement("li");
    li.setAttribute("page-number", i.toString());
    li.id = "page-indicator-number-" + i;

    const a = document.createElement("a");
    a.href = "#next";
    a.classList.add("smoothscroll");
    a.innerText = i.toString();
    li.appendChild(a);
    const beginning = document.getElementById('#next');
    li.addEventListener("click", function () {
      const next_page = parseInt(this.getAttribute("page-number"), 10);
      if (next_page !== current_page) {
        load_posts((next_page - 1) * posts_per_page, posts_per_page);
        document
          .getElementById("page-indicator-number-" + current_page)
          .classList.remove("active");
        this.classList.add("active");
        current_page = next_page;
      beginning.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });

    container.appendChild(li);
  }
  document.getElementById("page-indicator-number-1").classList.add("active");
}

async function load_posts(start_index, count) {
  if (!posts_cache.length) {

    const response = await fetch(`../locales/${lang}.json`);
    const data = await response.json();
    posts_cache = data.posts;
  }

  const posts = posts_cache;
  const total = posts.length;
  const limit = Math.min(count, total - start_index);

  if (!initialized) {
    build_page_indicators(total, posts_per_page);
    initialized = true;
  }

  const container = document.getElementById("posts-container");
  const slice = posts.slice(start_index, start_index + limit);

  container.innerHTML = slice
    .map((post, i) => {
      const isLazy = i >= slice.length - 3;
      return post_body(((i + 1) % 3) || 3, post, isLazy);
    })
    .join("");
}
load_posts(0, posts_per_page);

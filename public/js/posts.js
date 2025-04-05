const post_body = (index,id,tag,title,short_description,cover_image)=>{
    return `<div class="col-lg-4 col-md-6 col-sm-6 col-12 post mb-5" data-aos="fade-up" data-aos-delay="${index*100}">
            <div class="media media-custom d-block mb-4 h-100">
              <a data-post-id="${id}" class="mb-4 d-block post-link"><img src="../images/${cover_image}" alt="" class="img-fluid"></a>
              <div class="media-body">
                <span class="meta-post">${tag}</span>
                <h2 class="mt-0 mb-3"><a data-post-id="${id}" class="post-link">${title}</a></h2>
                <p>${short_description}</p>
              </div>
            </div>
          </div>`;
}
let current_page = 1;
const posts_per_page = 6;
let loaded = false;
load_posts(0,posts_per_page);

function page_indicator_builder(posts_count,posts_per_page){
    let pages = Math.ceil(posts_count / posts_per_page);
    let page_indicator = document.getElementById('page_indicator');

    for (let i = 1; i <= pages; i++) {
        let page_number = document.createElement('li');

        page_number.setAttribute('page-number', i.toString());
        page_number.id = 'page-indicator-number-' + i;
        page_number.addEventListener('click', function(event) {
            let next_page = this.getAttribute('page-number');
            let next_page_int = parseInt(next_page);
            if(next_page_int !== current_page){
                load_posts((next_page_int-1)*posts_per_page,posts_per_page);
                document.getElementById('page-indicator-number-' + current_page).classList.remove('active');
                this.classList.add('active');
                current_page = next_page_int;
            }
        });

        let page_number_anchor = document.createElement('a');
        page_number_anchor.href = '#next';
        page_number_anchor.classList.add('smoothscroll');
        page_number_anchor.innerText = i.toString();
        page_number.appendChild(page_number_anchor);
        page_indicator.appendChild(page_number);
    }
    document.getElementById('page-indicator-number-1').classList.add("active");
}

function load_posts(start_post_index, posts_count) {
    let lang = sessionStorage.getItem("lang");
    if(lang==null){
        lang = "en";
    }
    fetch(`../locales/${lang}.json`)
        .then(response => response.json())
        .then(data => {
            let posts = data.posts;
            let posts_length = posts.length;
            posts_count = posts_length< posts_count + start_post_index ? posts_length - start_post_index : posts_count;
            if(!loaded) {
                page_indicator_builder(posts_length, posts_per_page);
                loaded = true;
            }
            let container = document.getElementById('posts-container');
            container.innerHTML = '';
            let index_in_page = 1;
            for (let i = start_post_index; i < start_post_index+posts_count; i++) {
                let post = posts[i];
                container.innerHTML += post_body(index_in_page > 3 ? index_in_page - 3 : index_in_page,post.id, post.tag, post.title, post.summarize, post.main_image);
                ++index_in_page;
            }
            document.querySelectorAll('.post-link').forEach(el=>{
                el.addEventListener('click', ()=> {
                    let post_id = el.getAttribute('data-post-id');
                    window.open("post.html?name=" + posts[parseInt(post_id) - 1].title.toLowerCase(), "_self");
                });
            });
        });
}

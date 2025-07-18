const events = ['resize', 'load'];
const visual = document.getElementById("visual");
events.forEach(function(e){
    window.addEventListener(e, function(){
        const width = window.innerWidth;
        const height = window.innerHeight;
        const ratio = 45 / (width / height);
      visual.style.transform = "translate(-50%, -50%) rotate(-" + ratio + "deg)";
    });
});

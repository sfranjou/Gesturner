


// target.addEventListener('load', () => target.style.opacity = '0');
// If you want to remove it from the page after the fadeout
// target.addEventListener('transitionend', () => target.remove());

export function postMessage(message)
{
    let alert = document.createElement('div');
    alert.className = "alert alert-primary"; // bootstrap styling
    alert.style = "transition: opacity 1s";
    alert.textContent = message;

    alert.addEventListener('click', () => alert.style.opacity = '0'); //start fasding out after being loaded
    // alert.addEventListener('click', () => alert.remove()); //start fasding out after being loaded
    alert.addEventListener('transitionend', () => { alert.remove(); console.log("removed") });



    const holder = document.getElementById('messageHolder');
    holder.appendChild(alert);
    // alert.style.opacity = '0'
    setTimeout(() => { alert.style.opacity = 0 }, 1000)
}
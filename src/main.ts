const input = document.getElementById('textInput') as HTMLInputElement;
const output = document.getElementById('output') as HTMLDivElement;

input.addEventListener('input', (e) => {
    const text = (e.target as HTMLInputElement).value;
    console.log(text);
});

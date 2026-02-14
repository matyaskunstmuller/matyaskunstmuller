// DŮLEŽITÉ: Tento soubor musí být uložen v kódování UTF-8, aby se správně zobrazovala diakritika.

const buttonData = [
    // =================================
    // Bez Filtru (Spread 0)
    // =================================
    {
        spread: 0,
        text: `Autorská knížka
        
        Autorský deník zachycující období prozkoumávání modifikací kompaktu. Fotografie jsou doplněné o autorské vstupy vložené přímo do obrazu, které popisují tvůrčí proces a vývoj celého projektu`,
        styles: { top: '6%', left: '1%', width: '48%', height: '13%' }
    },
    {
        spread: 0,
        mediaSrc: 'media/Bez filtru_prezentační plakát1(barevný).webp',
        styles: { top: '35%', left: '4%', width: '28%', height: '55%' }
    },
    {
        spread: 0,
        mediaSrc: 'media/bez filtru_fotodokumentace knížky-03.webp',
        styles: { top: '1%', left: '50%', width: '50%', height: '50%' }
    },
    // Položky s left > 100% přesunuty na správné spready
    {
        spread: 3, // Původně 0, left 374% -> Spread 3, left 74%
        mediaSrc: 'media/bez filtru_fotodokumentace knížky-08.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    },
    {
        spread: 3, // Původně 0, left 374%
        mediaSrc: 'media/bez filtru_fotodokumentace knížky-10.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    },
    {
        spread: 0,
        mediaSrc: 'media/Návrhová plocha 2.webp',
        styles: { top: '50%', left: '50%', width: '24%', height: '49%' }
    },
    {
        spread: 0,
        mediaSrc: 'media/uaaa loda.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    },
    {
        spread: 3, // Původně 0, left 374%
        mediaSrc: 'media/DSC03806-2.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    },
    {
        spread: 3, // Původně 0, left 374%
        mediaSrc: 'media/ražba ve stanuplener.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    },
    {
        spread: 3, // Původně 0, left 374%
        mediaSrc: 'media/DSC03306.webp',
        styles: { top: '50%', left: '74%', width: '26%', height: '49%' }
    }
];
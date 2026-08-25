const socket=io('http://localhost:5000');

const textInput=document.getElementById('text-input');
const resultCard=document.getElementById('result');
const labelSpan=document.getElementById('label');
const confidenceDiv=document.getElementById('confidence');

textInput.addEventListener('keydown', (e) => {
    // Check if the user pressed Enter WITHOUT holding Shift
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevents the default action (adding a new line)
        
        const text = e.target.value.trim();
        if (text) {
            // Send the final text to the backend on Enter
            socket.emit('analyze_text', { text });
            
            // Optional: Clear the textarea after pressing Enter
            // textInput.value = ''; 
        }
    }
});

textInput.addEventListener('input',(e)=>{
    const text=e.target.value.trim();
    if(!text)
    {
        resultCard.style.display='none';
        return;
    }
    socket.emit('analyze_text',{text});
});

socket.on('sentiment_result',(data)=>{
    const {sentiment,confidence}=data;

    resultCard.style.display='block';
    labelSpan.innerText=sentiment.toUpperCase();
    confidenceDiv.innerText=`Confidence: ${(confidence*100).toFixed(2)}%`;

    if(sentiment==='positive')
    {
        resultCard.className='result-card positive';
    }
    else if(sentiment==='negative')
    {
        resultCard.className='result-card negative';
    }
});

socket.on('sentiment_error',(err)=>{
    console.error('Backend error:',err.error);
});
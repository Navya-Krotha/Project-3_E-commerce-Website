export const generateId = () => {
    const timeStamp = +new Date();
    const ts = timeStamp.toString();
    const parts = ts.split('').reverse();
    let id = '';

    for(let i = 0; i < 8; i++) {
        const index = Math.floor(Math.random() * parts.length);
        id += parts[index];
    }
    console.log("Generated Id: ", id);
    return id;
};
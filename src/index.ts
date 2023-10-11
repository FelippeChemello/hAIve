import AlignTextWithAudio from "./services/align-text-with-audio"
import path from 'node:path'
import fs from 'node:fs'

async function main() {
    const text = "Google mitiga maior ataque DDoS histórico, atingindo pico de 398 milhões de rps: o ataque, que durou dois minutos, usou uma nova técnica, chamada “HTTP/2 Rapid Reset”, explorando uma vulnerabilidade no protocolo (CVE-2023-44487) e permitindo ataques DDoS hipervolumétricos. Para se ter uma noção do tamanho do ataque, segundo a Clouflare, toda a web registra entre 1 e 3 bilhões de solicitações por segundo. As informações são dos blogs da Cloudflare e Google Cloud."
    const aligned = await AlignTextWithAudio(path.resolve(__dirname, '../tmp/newsletter.wav'), text)
    fs.writeFileSync('aligned.json', JSON.stringify(aligned, null, 2));
}

main().catch(console.error)
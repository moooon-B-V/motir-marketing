---
source: b6adcdeabaad
---

Um projeto público pode ser acessado em um endereço que você escolhe. Todo espaço de trabalho pode reivindicar um endereço próprio, e um projeto pode, além disso, responder em um domínio que você já possui.

## O seu endereço no Motir {#your-motir-address}

Um espaço de trabalho reivindica um único subdomínio, e todo projeto público dentro dele responde por baixo desse subdomínio — assim, `acme` dá a você `acme.motir.site/ROADMAP` para um projeto com a chave `ROADMAP`. Quem reivindica é um proprietário ou administrador do espaço de trabalho, em Configurações do projeto, em _Endereço público_.

Um rótulo tem letras minúsculas, dígitos e hifens, de três a sessenta e três caracteres. Um pequeno conjunto de nomes fica reservado para os hosts do próprio Motir e para nomes que alguém poderia confundir com eles.

Você pode renomeá-lo um número limitado de vezes, e o painel mostra quantas renomeações ainda restam. **O endereço antigo continua funcionando depois e nunca é liberado.** Ele redireciona permanentemente para o novo e não pode ser reivindicado por ninguém mais — nem por você, mais tarde. Isso é proposital: um link que alguém já compartilhou não pode um dia levar a um lugar que você não escolheu.

## Conectando o seu próprio domínio {#connecting-your-own-domain}

Conectar um domínio que você possui está disponível nos planos pagos — veja [nossos planos](/). O subdomínio do seu espaço de trabalho está incluído em todos os planos e continua funcionando de qualquer modo.

Um domínio conectado serve _um_ projeto, na sua raiz: `roadmap.acme.com/` é a página desse projeto e `roadmap.acme.com/changelog` é o seu registro de mudanças. O quadro ao vivo, os itens de trabalho e o roadmap ficam no aplicativo do Motir, e os links de lá levam até eles.

Você cria dois tipos de registro no seu registrador. **Adicione o domínio primeiro**, em Configurações do projeto, em _Endereço público_: o painel então lista todos os registros de que esse domínio precisa, com o valor exato e um botão de copiar em cada um. Os formatos abaixo são o que esperar — leia-os para conferir se o seu registrador consegue criá-los e pegue os valores no painel.

### 1 · Aponte o domínio para nós {#point-the-domain-at-us}

Para um **subdomínio** como `roadmap.acme.com`, um `CNAME`:

| Tipo    | Nome      | Valor              |
| ------- | --------- | ------------------ |
| `CNAME` | `roadmap` | mostrado no painel |

Para um **domínio raiz** como `acme.com`, um `A` e um `AAAA` no lugar — um domínio raiz não pode receber um `CNAME`, porque já carrega os registros `MX` e `TXT` dos quais o seu e-mail e os seus outros serviços dependem:

| Tipo   | Nome | Valor              |
| ------ | ---- | ------------------ |
| `A`    | `@`  | mostrado no painel |
| `AAAA` | `@`  | mostrado no painel |

Copie cada valor do painel, e não de qualquer outro lugar. Estes são os endereços em que o Motir é servido, lidos da plataforma em que rodamos, e eles podem mudar — o painel muda junto, e uma página como esta não.

> Se o seu provedor de DNS oferecer um botão de “proxy” ou “nuvem” no registro, desative-o: um proxy na frente do registro esconde o seu domínio da verificação, e o certificado não pode ser emitido.

### 2 · Comprove que o domínio é seu {#prove-the-domain-is-yours}

Junto com o registro de apontamento, o painel lista um registro `TXT` com um token dentro, neste formato:

| Tipo  | Nome                    | Valor            |
| ----- | ----------------------- | ---------------- |
| `TXT` | `_motir-verify.roadmap` | `motir-verify=…` |

Copie o valor do painel, e não daqui — o token é só seu. Depois escolha _Verificar_. Quando conseguirmos ver o registro, solicitamos um certificado, o que costuma levar um ou dois minutos. Você pode fechar a página; o status continua avançando sozinho, e os registros permanecem disponíveis em _Mostrar registros DNS_.

## O que cada status significa {#what-each-status-means}

[//]: # "Translator: the Status column names states the product itself shows. Use the label the app's own messages file for your locale gives each state, not a fresh translation, so this table matches the screen."

| Status         | O que significa                                                                                                                                        | O que fazer                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| Não verificado | Ainda não vimos o seu registro de propriedade. Nada foi solicitado à autoridade certificadora.                                                         | Crie o registro TXT abaixo e depois escolha Verificar novamente.              |
| Verificando…   | Estamos procurando o registro de propriedade agora. As mudanças de DNS podem levar alguns minutos para se espalhar.                                    | Espere um momento. Ele avança sozinho.                                        |
| Emitindo…      | A propriedade está comprovada e o certificado foi solicitado. Isso costuma levar um ou dois minutos.                                                   | Nada. O Motir faz o resto.                                                    |
| Ativo          | O certificado foi emitido e o seu domínio serve o projeto. Ele é renovado sozinho.                                                                     | Você pode tornar este endereço o principal.                                   |
| Falhou         | Não foi possível emitir o certificado. O motivo aparece ao lado do status — quase sempre um registro que está faltando ou que aponta para outro lugar. | Compare os seus registros com os abaixo e depois escolha Verificar novamente. |
| Expirado       | O certificado expirou e a renovação não deu certo — quase sempre porque um registro DNS mudou. O domínio não está servindo.                            | Devolva os registros ao que eram e depois escolha Verificar novamente.        |
| Revogado       | O certificado foi retirado. O domínio não está servindo.                                                                                               | Escolha Solicitar novamente para iniciar um novo certificado.                 |

## Qual endereço é o verdadeiro {#which-address-is-the-real-one}

Um projeto pode responder em vários endereços, e exatamente um deles é o _principal_ — aquele que os mecanismos de busca e as prévias em redes sociais recebem. Quando o certificado de um domínio conectado estiver ativo, você pode torná-lo o principal; até lá, o principal é o endereço do Motir.

**Todos os outros endereços redirecionam para o principal.** Isso inclui o seu endereço `motir.co` depois que você promover um domínio próprio. Os visitantes sempre chegam a um lugar que funciona, e um mecanismo de busca vê uma página, e não três cópias competindo entre si.

## Removendo um domínio {#removing-a-domain}

Remover um domínio conectado retira o certificado dele e o endereço deixa de responder — quem o estiver usando receberá um erro, e os links já compartilhados para ele deixam de funcionar. O seu projeto continua público nos outros endereços, então remover um domínio nunca torna um projeto privado.

## Se algo não estiver funcionando {#if-something-is-not-working}

Três erros respondem por quase todas as falhas, e cada um aparece de um jeito diferente no painel.

- **Um CNAME em um domínio raiz.** A maioria dos registradores o aceita e ele não funciona. O sintoma é um domínio que fica em `Not verified` ou chega a `Failed`. Use os registros `A` e `AAAA` acima.
- **Um provedor de DNS com proxy na frente do registro.** Se o seu provedor oferece fazer proxy ou acelerar o tráfego, isso esconde de nós o registro real. O sintoma é um `Checking…` que nunca se resolve. Desative o proxy para esses registros.
- **Um registro de propriedade desatualizado.** Se você removeu e adicionou o domínio de novo, o token mudou. O sintoma é `Not verified` enquanto um registro `TXT` está claramente lá. Substitua o valor dele pelo que o painel mostra agora.

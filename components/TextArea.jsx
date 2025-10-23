"use client"

/**
 * @param {import("react").FormEvent<HTMLFormElement>} event 
 */
function sendForm(event) {
  event.preventDefault();

  const formData = new FormData(event.currentTarget);
  const data = Object.fromEntries(formData);

  console.log(data);
}

export default function TextArea({}) {
  return <form onSubmit={(event) => sendForm(event)}>
    <textarea name="content" id="content" cols="30" rows="10"></textarea>
    <button type="submit">Salvar</button>
  </form>
}
import React, { useEffect } from 'react'
import './App.css'
import './Zapier.css'
import { uid, token } from './files/accesos'

function App() {

	//const [paginas, setPaginas] = React.useState(paginas)
	const [pagina, setPagina] = React.useState()
	const [paginas, setPaginas] = React.useState([])
	const [tokenPagina, setTokenPagina] = React.useState("")
	const [leadForms, setLeadForms] = React.useState([])
	const [leadForm, setLeadForm] = React.useState({})
	const [leads, setLeads] = React.useState([])
	const [leadFields, setLeadFields] = React.useState([]);

	const inicializaTodo = () => {
		// setPagina()
		// setTokenPagina("")
		setLeadForms([])
		setLeadForm({})
		setLeads([])
		setLeadFields([])
	}

	const cambiaLeadForm = event => {
		let formId = Number(event.target.value)
		let nuevoForm = leadForms.find(form => form.id == formId)
		iniciaFormulario(nuevoForm)
	}

	const cambiaPagina = event => {
		inicializaTodo()
		let pageId = Number(event.target.value)
		let nuevaPagina = paginas.find(pagina => pagina.id == pageId)
		iniciaPagina(nuevaPagina)
	}

	const buscaPaginas = () => {
		fetch('https://graph.facebook.com/v6.0/' + uid + '/assigned_pages?access_token=' + token)
			.then(res => res.json().then(r => setPaginas(r.data)))
			.catch(err => console.log(err))
	}

	const iniciaPagina = (nuevaPagina) => {
		setPagina(nuevaPagina)
		fetch("https://graph.facebook.com/" + nuevaPagina.id + "?fields=access_token&access_token=" + token)
			.then(res => res.json()
				.then(r => {
					let tp = r.access_token
					setTokenPagina(tp)
					fetch('https://graph.facebook.com/v6.0/' + nuevaPagina.id + '/leadgen_forms?access_token=' + tp)
						.then(res => res.json().then(r => {
							setLeadForms(r.data)
							console.log(r.data[0])
							return iniciaFormulario(r.data[0])
						}))
						.catch(err => console.log(err))
				}))
			.catch(err => console.log(err))
	}

	const iniciaFormulario = (nuevoForm) => {
		setLeadForm(nuevoForm)
		fetch("https://graph.facebook.com/" + nuevoForm.id + "/leads?access_token=" + token)
			.then(res => res.json().then(r => {
				console.log(r)
				let ls = r.data
				let campos = []
				ls[0].field_data.map(field => campos.push(field.name))
				console.log(campos)
				console.log("ls", ls)
				setLeadFields(campos)
				setLeads(ls)
			}))
			.catch(err => console.log(err))
	}

	useEffect(() => {
		return buscaPaginas()
	}, [])

	const _checkFields = (fields, leads) => {
		if (fields.length > 0 && leads.length > 0) {
			let lead = leads[0]
			let check = true
			let campo, existe
			for (let i = 0; i < fields.length; i++) {
				campo = fields[i]
				existe = false
				if (typeof lead.field_data.find(l => l.name == campo) === "undefined") {
					check = false;
				}
			}
			return check
		} else {
			return false
		}
	}

  return (
    <div className="App">
			<header className="App-header">
				<p>{ pagina ? pagina.name : "" }</p>
				<p>{ pagina ? "Id: " + pagina.id : "" }</p>
				<p>{ typeof leadForm.id !== "undefined" ? "Id Form: " + leadForm.id : "" }</p>
				<select onChange={cambiaPagina}>
					{  
						paginas.map(p => <option value={p.id} key={p.id}>{p.id} - {p.name}</option>)
					}
				</select>
				{ typeof pagina !== "undefined" 
						? <select onChange={cambiaLeadForm}>
								{leadForms.map(form => <option value={form.id} key={form.id}>{form.id} - {form.name}</option>)}
							</select>
						: <p></p> }						
				{ 
					_checkFields(leadFields, leads)
						? <table>
								{leadFields.map((field, i) => <th key={i}>{field}</th>)}
								<tbody>
									{ console.log("leads", leads) }
									{ console.log("leadFields", leadFields) }
									{
										leads.map((lead, k) => <tr key={k}> {
											leadFields.map((field, i) => <td key={i}>{lead.field_data.find(f => f.name === field).values[0]}</td>)
										} </tr>)
									}
								</tbody>
							</table>
						:	<span></span>
				}
      </header>
    </div>
  )
}

export default App

import React from 'react';
import './diseases.css'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { diseasesList } from './diseasesList'
import { getDiseases, putDisease, putDiseasesSelected } from './dbController'


export class Diseases extends React.Component {
	_isMounted = false;

	constructor(props) {
		super(props);
		let date = (new Date()).toISOString().substring(0, 10);
		this.state = {
			date: date,
			diseases: {},
			diseasesTracked: null,
			modalShow: false,
		}
		// Disease description handle
		this.handleDiseaseDescriptionSave = this.handleDiseaseDescriptionSave.bind(this)

		// Modal handles
		this.handleCloseModal = this.handleCloseModal.bind(this)
		this.handleShowModal = this.handleShowModal.bind(this)
		this.saveDiseases = this.saveDiseases.bind(this)
	}

	componentDidMount() {
		this._isMounted = true;

		// TODO: move this to the constructor in order to avoid double rendering
		if (!this.props.idToken) {
			return
		}
		getDiseases(this.state.date, this.props.idToken)
			.then(
				(result) => {
					let diseases = {}
					let diseasesTracked = []
					result.forEach(element => {
						diseases[element.disease] = {
							diseaseDescription: element.diseaseDescription,
							disease: element.disease
						}
						diseasesTracked.push(element.disease)
					}
					);
					if (this._isMounted) {
						this.setState({
							diseases: diseases,
							diseasesTracked: diseasesTracked,
							modalShow: false
						});
					}
				},
				(error) => {
					// TODO: handle error 
					if (this._isMounted) {
						this.setState({
							isLoaded: true,
							error
						});
					}
				}
			)
	}

	componentWillUnmount() {
		this._isMounted = false;
	}

	renderDiseaseContainer(disease_dobj) {
		// TODO: Order the diseases
		let disease = disease_dobj[0]
		let diseaseDescription = disease_dobj[1].diseaseDescription
		return (
			<DiseaseContainer key={disease}
				disease={disease}
				diseaseDescription={diseaseDescription}
				handleDiseaseDescriptionSave={this.handleDiseaseDescriptionSave} />
		);
	}

	handleDiseaseDescriptionSave(disease, diseaseDescription) {
		console.log("save disease description")
		console.log("disease: ", disease)
		console.log("diseaseDescription: ", diseaseDescription)


		let diseases = Object.assign({}, this.state.diseases);
		if (diseases[disease]) {
			if (diseases[disease]["diseaseDescription"] === diseaseDescription) {
				// If no change was performed, we want to avoid to save a write in the db
				return
			}
			diseases[disease]["diseaseDescription"] = diseaseDescription
		} else {
			diseases[disease] = {
				"diseaseDescription": diseaseDescription,
				"disease": disease
			}
		}

		putDisease(this.state.date, disease, diseaseDescription, this.props.idToken)
		this.setState({
			diseases: diseases
		})
	}

	handleCloseModal() {
		this.setState({
			modalShow: false
		})
	}

	handleShowModal() {
		this.setState({
			modalShow: true
		})
	}

	renderAddDiseaseButton() {
		return (
			<AddDiseaseButton
				handleShow={this.handleShowModal} />
		);
	}

	saveDiseases(diseasesSelected) {
		if (diseasesSelected.length > 3) {
			alert("You cannot add more than 3 diseases at this time!")
			return
		}
		putDiseasesSelected(diseasesSelected, this.props.idToken).then(
			() => {
				// If everything went allright, I need to call again to the get endpoint
				this.componentDidMount()
			}
		)
	}

	renderModal() {
		if (this.state.diseasesTracked !== null) {
			// We do not want to render the modal until getting the response from database
			return (
				<DiseasesModal
					diseasesAvailable={diseasesList}
					diseasesTracked={this.state.diseasesTracked}
					show={this.state.modalShow}
					handleClose={this.handleCloseModal}
					saveDiseases={this.saveDiseases} />
			);
		}
	}

	render() {
		return (
			<div className="main-dashboard">
				<div className="diseases-dashboard">
					{Object.entries(this.state.diseases).map((d) => this.renderDiseaseContainer(d))}
				</div>
				<div className="add-diseases-container">
					{this.renderAddDiseaseButton()}
					{this.renderModal()}
				</div>
			</div>
		)
	}
}


class DiseaseContainer extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			isSelected: false,
		}
	}

	getClasses() {
		return "disease-container" + (this.state.isSelected ? " disease-selected" : "")
	}

	handleClick() {
		this.setState({
			isSelected: !this.state.isSelected
		})
	}

	renderDiseaseButton(disease) {
		return (
			<DiseaseButton
				value={disease}
				onClick={() => this.handleClick()} />
		);
	}
	renderDiseaseDescription(disease) {
		return (
			<DiseaseDescription
				value={disease}
				diseaseDescription={this.props.diseaseDescription}
				onBlur={this.props.handleDiseaseDescriptionSave}
			/>
		);
	}

	render() {
		return (
			<div className={this.getClasses()}>
				{this.renderDiseaseButton(this.props.disease)}
				{this.renderDiseaseDescription(this.props.disease)}
			</div>
		);
	}
}

class DiseaseButton extends React.Component {
	render() {
		return (
			<button className="disease-button" onClick={() => this.props.onClick()}>
				{this.props.value}
			</button>
		);
	}
}

class DiseaseDescription extends React.Component {
	render() {
		return (
			<div className="disease-description">
				<textarea className="disease-description"
					type="text" placeholder="No notable symptoms"
					onBlur={(e) => this.props.onBlur(this.props.value, e.target.value)}
					defaultValue={this.props.diseaseDescription}
				/>
			</div>
		);
	}
}


class AddDiseaseButton extends React.Component {

	render() {

		return (
			<button className="add-disease-button" onClick={this.props.handleShow}>
				+
			</button>
		);
	}
}


class DiseasesModal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			diseasesSelected: this.props.diseasesTracked
		}
	}

	handleClick(disease) {
		let diseasesSelected = this.state.diseasesSelected.slice()
		let dis_ix = diseasesSelected.indexOf(disease)
		if (dis_ix >= 0) {
			// The disease was already selected, so remove it
			diseasesSelected.splice(dis_ix, 1)
		} else {
			// Add the disease
			diseasesSelected.push(disease)
		}
		this.setState({
			diseasesSelected: diseasesSelected
		})
	}

	renderDisease(disease) {
		let cls = "list-group-item list-group-item-action"
		// TODO: avoid using a for loop each time
		if (this.state.diseasesSelected.includes(disease)) {
			cls += " active"
		}
		return (
			<button type="button" key={disease} className={cls} onClick={() => this.handleClick(disease)}>{disease}</button>
		)
	}

	render() {
		return (
			<Modal show={this.props.show} onHide={this.props.handleClose}>
				<Modal.Header closeButton>
					<Modal.Title>Add the diseases you want to track</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="list-group">
						{this.props.diseasesAvailable.map((d) => this.renderDisease(d))}
					</div>

				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={this.props.handleClose}>
						Close
          </Button>
					<Button variant="primary" onClick={() => this.props.saveDiseases(this.state.diseasesSelected)}>
						Save
          </Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


import React from 'react';
import { useHistory } from "react-router-dom";
import './diseases.css'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { diseasesList } from './diseasesList'
import { getDiseases, putDisease, putDiseasesSelected } from './dbController'
import { DatesNavigator } from '../common'


export class Diseases extends React.Component {
	_isMounted = false;

	constructor(props) {
		super(props);
		this.state = {
			diseases: {},
			diseasesTracked: null,
			modalShow: false,
			selectedDisease: null
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
		getDiseases(this.props.date, this.props.idToken)
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

	renderDatesNavigator() {
		return (
			<DatesNavigator
				date={this.props.date}
				onLeftClick={() => this.props.showPreviousDate()}
				onRightClick={() => this.props.showNextDate()} />
		)
	}

	renderDiseaseContainer(disease_dobj) {
		// TODO: Order the diseases
		let disease = disease_dobj[0]
		let diseaseDescription = disease_dobj[1].diseaseDescription
		let isSelected = false
    if (this.state.selectedDisease === disease) {
      isSelected = true
    }
		return (
			<DiseaseContainer key={disease}
				isSelected={isSelected}
				disease={disease}
				diseaseDescription={diseaseDescription}
				handleDiseaseDescriptionSave={this.handleDiseaseDescriptionSave}
				selectDisease={(e) => this.selectDisease(e)} />
		);
	}

	handleDiseaseDescriptionSave(disease, diseaseDescription) {
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

		putDisease(this.props.date, disease, diseaseDescription, this.props.idToken)
		this.setState({
			diseases: diseases
		})
	}

	selectDisease(disease) {
    if (this.state.selectedDisease === disease){
      // If the user clicks again in a selected button, unselect it
      this.setState({
        selectedDisease: null
      })
      return
    }
    this.setState({
      selectedDisease: disease
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

	renderChangePageButton() {
		return (
			<ChangePageButton />
		);
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
			<div className="main-container">
				<div className="main-header">
					{this.renderDatesNavigator()}
				</div>
				<div className="main-body">
					<div className="diseases-dashboard">
						{Object.entries(this.state.diseases).map((d) => this.renderDiseaseContainer(d))}
					</div>
					<div className="side-section">
						<div className="change-page-container">
							{this.renderChangePageButton()}
						</div>
					</div>
				</div>
				<div className="main-footer">
					<div className="add-diseases-container">
						{this.renderAddDiseaseButton()}
						{this.renderModal()}
					</div>
				</div>
			</div>
		)
	}
}


class DiseaseContainer extends React.Component {

	getClasses() {
		return "disease-container" + (this.props.isSelected ? " disease-selected" : "")
	}

	renderDiseaseButton(disease) {
		return (
			<DiseaseButton
				value={disease}
				onClick={() => this.props.selectDisease(disease)} />
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
			<button className="disease-button btn btn-success" onClick={() => this.props.onClick()}>
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
			<button className="btn-center add-disease-button" onClick={this.props.handleShow}>
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
					<Modal.Title>Select diseases</Modal.Title>
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

// Stay Dry, move this to a common file
function ChangePageButton() {
	const history = useHistory();

	function handleClick() {
		history.push("/dashboard");
	}
	return (
		<button className="btn" onClick={handleClick}>
			<svg className="bi bi-chevron-right" width="32" height="64" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
				<path fillRule="evenodd" d="M6.646 3.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L12.293 10 6.646 4.354a.5.5 0 010-.708z" />
			</svg>
		</button>
	);
}


import React from 'react';
import './diseases.css'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import { diseasesList } from './diseasesList'


export class Diseases extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			diseasesTracked: ["Rosacea"],
			modalShow: false,
		}
		// Disease description handle
		this.handleDiseaseDescriptionSave = this.handleDiseaseDescriptionSave.bind(this)

		// Modal handles
		this.handleCloseModal = this.handleCloseModal.bind(this)
		this.handleShowModal = this.handleShowModal.bind(this)
		this.saveDisease = this.saveDisease.bind(this)
	}

	renderDiseaseContainer(disease) {
		// TODO: Order the diseases
		return (
			<DiseaseContainer
				disease={disease}
				handleDiseaseDescriptionSave={this.handleDiseaseDescriptionSave} />
		);
	}

	handleDiseaseDescriptionSave(diseaseDescription) {
		console.log("save disease description")
		console.log(diseaseDescription)
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

	saveDisease(diseasesSelected) {
		console.log("save disease")
		console.log(diseasesSelected)
		if (diseasesSelected.length > 3) {
			alert("You cannot add more than 3 diseases at this time!")
			return
		}
		this.setState({
			diseasesTracked: diseasesSelected,
			modalShow: false
		})
	}

	renderModal() {
		return (
			<DiseasesModal
				diseasesAvailable={diseasesList}
				diseasesTracked={this.state.diseasesTracked}
				show={this.state.modalShow}
				handleClose={this.handleCloseModal}
				saveDisease={this.saveDisease} />
		);
	}

	render() {
		return (
			<div className="main-dashboard">
				<div className="diseases-dashboard">
					{this.state.diseasesTracked.map((d) => this.renderDiseaseContainer(d))}
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
          onBlur={(e) => this.props.onBlur(e.target.value)}
          defaultValue={this.props.diseaseDescription}
        />
      </div>
    );
  }
}


class AddDiseaseButton extends React.Component {

	render() {

		return (
			<button className="add-disease-button" onClick={() => this.props.handleShow()}>
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
			<button type="button" className={cls} onClick={() => this.handleClick(disease)}>{disease}</button>
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
					<Button variant="primary" onClick={() => this.props.saveDisease(this.state.diseasesSelected)}>
						Save
          </Button>
				</Modal.Footer>
			</Modal>
		);
	}
}


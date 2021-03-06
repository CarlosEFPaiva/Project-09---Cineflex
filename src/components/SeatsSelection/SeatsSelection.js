import "./SeatsSelection.css";
import { useParams, useHistory} from "react-router-dom";
import Loading from "../Loading/Loading.js";
import {getSeatsForSession, adjustSelectedSeatsDataAndSendToServer, displayError } from "../../serverFunctions.js";
import { useEffect, useState } from "react";

export default function SeatsSelection({selectedSession, setSelectedSession,selectedSeats,checkSeatAvailability, changeClientData}) {
    const browsingHistory = useHistory();
    const sessionId = useParams().sessionId;
    const [isPostRequisitionSent, setIsPostRequisitionSent] = useState(false);
    useEffect(() => {
        getSeatsForSession(sessionId)
            .then( resp => setSelectedSession(resp.data))
            .catch( () => { displayError(browsingHistory) } );
        }
    ,[]);

    const seatExamples = [
        {description: "Selecionado", seatClass:"selected"},
        {description: "Disponível", seatClass:"available"},
        {description: "Indisponível", seatClass:"unavailable"}
    ];

    if(!selectedSession.seats || isPostRequisitionSent) {
        return (
            <Loading />
        );
    };

    return (
        <section className = "seats-screen">
            <p>Selecione o(s) assento(s)</p>
            <div className="session-seats">
                {selectedSession.seats.map( ({name,id, isAvailable},index) => 
                    <Seat 
                        key = {index}
                        name = {name}
                        id = {id} 
                        isAvailable = {isAvailable}
                        selectedSeats = {selectedSeats}
                        checkSeatAvailability = {checkSeatAvailability}
                    /> )}
            </div>
            <div className="seats-explanation">
                {seatExamples.map( ({description,seatClass},index) => 
                    <SeatExplanation 
                        key = {index}
                        description = {description}
                        seatClass = {seatClass}
                    />)}
            </div>
            <div className="clients-info">
                {selectedSeats.clients.map( (clientData,index) => 
                    <ClientsData
                        key = {index}
                        clientData = {clientData}
                        changeClientData = {changeClientData}
                    /> )}
            </div>
            <ForwardButton
                selectedSeats = {selectedSeats}
                browsingHistory = { browsingHistory }
                setIsPostRequisitionSent = {setIsPostRequisitionSent}
            />
        </section>
    );
};

function Seat ({name, id, isAvailable, selectedSeats, checkSeatAvailability}) {
    let seatClass;
    if (selectedSeats.ids.includes(id)) {
        seatClass = "selected";
    } else if (isAvailable) {
        seatClass = "available";
    } else {
        seatClass = "unavailable";
    };
    return (
        <button onClick = {() => checkSeatAvailability({name, id, seatClass})}>
            <div className={`seat ${seatClass}`}>{name}</div>
        </button>
    );
};

function SeatExplanation ({description,seatClass}) {
    return (
        <div>
            <div className={`seat ${seatClass}`}></div>
            {description ? <span>{description}</span> : ""}
        </div>
    );
};

function ClientsData({clientData,changeClientData}) {
    return (
        <div className="client-data">
            <p>
                Nome do comprador do assento {clientData.seatName}:
            </p>
            <input 
                onChange = { (e) => changeClientData( "name", e.target.value, clientData.seatName )}
                placeholder= "Digite seu nome..."
                value = {clientData.nome}
            />
            <p>
                CPF do comprador do assento {clientData.seatName}:
            </p>
            <input
                type = "number"
                onChange = { (e) => changeClientData( "cpf", e.target.value, clientData.seatName )}
                placeholder= "Digite seu CPF..."
                value = {clientData.cpf}
            />
        </div>
    );
}

function ForwardButton ({selectedSeats, browsingHistory, setIsPostRequisitionSent}) {
    function isClientDataValid({nome,cpf}) {
        return nome.length && cpf.length === 11 ;
    };

    function checkDataValidation() {
        if (selectedSeats.clients.length) {
            if (selectedSeats.clients.every( ({nome,cpf}) => isClientDataValid({nome,cpf}) )) {
                setIsPostRequisitionSent(true);
                const postPromise = adjustSelectedSeatsDataAndSendToServer(selectedSeats);
                postPromise
                    .then(() => { browsingHistory.push("/sucesso") })
                    .catch( () => { displayError(browsingHistory) } );
            } else {alert("Por favor complete as informações dos compradores de forma correta")};
        }else {alert("Por favor selecione ao menos um assento")};
    };

    return (
        <button className="forward" onClick = {checkDataValidation} >
            Reservar assento(s)
        </button>
    );
}
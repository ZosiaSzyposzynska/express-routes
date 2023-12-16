import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Progress, Alert } from 'reactstrap';
import io from 'socket.io-client';
import { getSeats, loadSeats, loadSeatsRequest, getRequests } from '../../../redux/seatsRedux';

import './SeatChooser.scss';

const SeatChooser = ({ chosenDay, chosenSeat, updateSeat }) => {
  const dispatch = useDispatch();
  const seats = useSelector(getSeats);
  const requests = useSelector(getRequests);
  const [socket, setSocket] = useState();
  const [freeSeatsSummary, setFreeSeatsSummary] = useState({ totalSeats: 50 });

  useEffect(() => {
    dispatch(loadSeatsRequest());

    const newSocket = io(process.env.NODE_ENV === 'production' ? '' : 'ws://localhost:8000', { transports: ['websocket'] });
    setSocket(newSocket);
    newSocket.on('seatsUpdated', (updatedSeats) => {
      dispatch(loadSeats(updatedSeats));
      const updatedSummary = calculateFreeSeats(updatedSeats, chosenDay);
      setFreeSeatsSummary(updatedSummary);
    });

   
    newSocket.on('seatsSummaryUpdated', (summary) => {
      setFreeSeatsSummary(summary);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [dispatch, chosenDay]);

  const calculateFreeSeats = (updatedSeats, day) => {
    const totalSeats = 50;
    const takenSeats = updatedSeats.filter(seat => seat.client && seat.day === day).length;
    const freeSeats = totalSeats - takenSeats;

    return {
      totalSeats: totalSeats,
      takenSeats: takenSeats,
      freeSeats: freeSeats,
    };
  };

  const isTaken = (seatId) => {
    return seats.some(item => item.seat === seatId && item.day === chosenDay);
  };

  const prepareSeat = (seatId) => {
    if (seatId === chosenSeat) return <Button key={seatId} className="seats__seat" color="primary">{seatId}</Button>;
    else if (isTaken(seatId)) return <Button key={seatId} className="seats__seat" disabled color="secondary">{seatId}</Button>;
    else return <Button key={seatId} color="primary" className="seats__seat" outline onClick={(e) => updateSeat(e, seatId)}>{seatId}</Button>;
  };

  
  useEffect(() => {
    const initialSummary = calculateFreeSeats(seats, chosenDay);
    setFreeSeatsSummary(initialSummary);
  }, [seats, chosenDay]);

  return (
    <div>
      <h3>Pick a seat</h3>
      <p>Free seats: {freeSeatsSummary.freeSeats}/{freeSeatsSummary.totalSeats}</p>
      <div className="mb-4">
        <small id="pickHelp" className="form-text text-muted ms-2"><Button color="secondary" /> – seat is already taken</small>
        <small id="pickHelpTwo" className="form-text text-muted ms-2"><Button outline color="primary" /> – it's empty</small>
      </div>
      {requests['LOAD_SEATS'] && requests['LOAD_SEATS'].success && <div className="seats">{[...Array(50)].map((x, i) => prepareSeat(i + 1))}</div>}
      {requests['LOAD_SEATS'] && requests['LOAD_SEATS'].pending && <Progress animated color="primary" value={50} />}
      {requests['LOAD_SEATS'] && requests['LOAD_SEATS'].error && <Alert color="warning">Couldn't load seats...</Alert>}
    </div>
  );
};

export default SeatChooser;

import api from "./api";
import { SlotReservationRequest, SlotReservationResponse } from "./reservation.types";

export const reservationApi = {

  requestSlot: async (data: SlotReservationRequest): Promise<SlotReservationResponse> => {
    const response = await api.post("/campushub-scheduling-service/api/scheduling/reservations", data);
    return response.data;
  },

  getMyReservations: async (teacherId: number) => {
    const response = await api.get(`/campushub-scheduling-service/api/scheduling/reservations/my?teacherId=${teacherId}`);
    return response.data;
  },
  cancelReservation: async (id: number, teacherId: number): Promise<void> => {
    await api.delete(
      `/campushub-scheduling-service/api/scheduling/reservations/${id}?teacherId=${teacherId}`
    );
  },
};

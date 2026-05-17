package vn.lum1nous.trackify.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class JobKanbanResponse {

    private List<JobKanbanCardResponse> cards;

    public List<JobKanbanCardResponse> getCards() {
        return cards;
    }

    public void setCards(List<JobKanbanCardResponse> cards) {
        this.cards = cards;
    }
}

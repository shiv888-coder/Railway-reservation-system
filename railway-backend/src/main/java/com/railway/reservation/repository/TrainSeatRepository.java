package com.railway.reservation.repository;

import com.railway.reservation.entity.BaseTrainEntity;
import com.railway.reservation.entity.TrainSeatEntity;
import com.railway.reservation.enums.CoachClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Spring Data JPA Repository for TrainSeatEntity (Class-wise Inventory & Tariffs).
 *
 * Primary Key: Long (Record ID)
 */
@Repository
public interface TrainSeatRepository extends JpaRepository<TrainSeatEntity, Long> {

    /**
     * Find seat inventory for a train entity and specific coach class.
     */
    Optional<TrainSeatEntity> findByTrainAndCoachClass(BaseTrainEntity train, CoachClass coachClass);

    /**
     * Find seat inventory by train number and coach class.
     */
    Optional<TrainSeatEntity> findByTrain_TrainNumberAndCoachClass(String trainNumber, CoachClass coachClass);

    /**
     * Find all seat class configurations for a given train number.
     */
    List<TrainSeatEntity> findByTrain_TrainNumber(String trainNumber);

    /**
     * Query available seat count directly for a train number and class.
     */
    @Query("SELECT s.availableSeats FROM TrainSeatEntity s WHERE " +
           "s.train.trainNumber = :trainNumber AND s.coachClass = :coachClass")
    Optional<Integer> findAvailableSeats(
            @Param("trainNumber") String trainNumber,
            @Param("coachClass") CoachClass coachClass
    );

    /**
     * Sum total available seats across the entire railway network (for Dashboard KPI).
     */
    @Query("SELECT COALESCE(SUM(s.availableSeats), 0) FROM TrainSeatEntity s")
    Long sumTotalNetworkAvailableSeats();
}

INSERT INTO
    activities (title, dateCompleted, timeCompleted, notes, categoryId, userId)
    VALUES
        (
            'watered brussels sprouts', '2020-10-05', NULL, 'Watered lightly because it is supposed to rain tonight', 3, 1
            -- arbitrarily assigning foreign keys here, just to get started
        ),
        (
            'weeded raspberry bushes', '2020-10-01', NULL, NULL, 1, 2
        ),
        (
            'mulched garden beds', '2020-09-22', NULL, 'worried about this one', 2, 3
        ),
        (
            'watered lavender', '2020-09-30', NULL, NULL, 3, 1
        );

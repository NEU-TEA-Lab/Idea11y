import numpy as np
from sklearn.cluster import DBSCAN

def create_corner_points(center_x, center_y, width, height):
    half_width = width / 2
    half_height = height / 2
    return [
        [center_x - half_width, center_y - half_height],
        [center_x - half_width, center_y + half_height],
        [center_x + half_width, center_y - half_height],
        [center_x + half_width, center_y + half_height]
    ]


def group_sticky_notes_by_proximity(data: list):
    """
    Groups sticky notes by proximity using DBSCAN clustering.
    Considers the dimensions of the sticky notes.
    Returns a map with labels as keys and a list of the original data points as values.
    """

    # Create corner points for each sticky note
    all_corners = []
    for point in data:
        corners = create_corner_points(point['x'], point['y'], point['width'], point['height'])
        all_corners.extend(corners)

    points = np.array(all_corners)

    # Determine eps based on the average dimensions of the sticky notes
    avg_width = np.mean([point['width'] for point in data])
    avg_height = np.mean([point['height'] for point in data])
    eps = max(avg_width, avg_height) * 1.1  # 10% larger than the largest average dimension

    # Perform DBSCAN clustering
    dbscan = DBSCAN(eps=eps, min_samples=1)
    labels = dbscan.fit_predict(points)

    # Map the labels back to the original sticky notes
    note_labels = labels.reshape(-1, 4)[:, 0]  # Take the label of the first corner for each note

    # Group the original data points by their labels
    grouped_data = {}
    for label, data_point in zip(note_labels, data):
        if label not in grouped_data:
            label = int(label)
            grouped_data[label] = []
        grouped_data[label].append(data_point)

    return grouped_data
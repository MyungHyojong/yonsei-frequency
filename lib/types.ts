export type Emotion = "설렘" | "그리움" | "위로" | "기쁨" | "고요" | "열정";

export type Story = {
  id: string;
  place: string;
  title: string;
  story: string;
  nickname: string;
  youtube_id: string;
  latitude: number;
  longitude: number;
  color: string;
  emotion?: Emotion;
  status?: "published" | "hidden";
  created_at?: string;
};

export type StoryInput = Omit<Story, "id" | "color" | "status" | "created_at"> & {
  youtube_url: string;
  quiz_answer: string;
};

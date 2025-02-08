from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import relationship
from sqlalchemy import DateTime, Integer, String, Text, Boolean, ForeignKey

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(Integer, primary_key=True)
    tag = db.Column(String(50), unique=True, nullable=False)  # np. #inbox, #praca
    name = db.Column(String(100))  # Opcjonalna przyjazna nazwa
    created_at = db.Column(DateTime, default=datetime.utcnow)
    deleted_at = db.Column(DateTime, nullable=True)  # Soft delete
    
    # Relacje
    notes = relationship('Note', backref='project', lazy=True)
    tasks = relationship('Task', backref='project', lazy=True)

    @property
    def is_deleted(self):
        return self.deleted_at is not None

class Note(db.Model):
    __tablename__ = 'notes'
    
    id = db.Column(Integer, primary_key=True)
    content = db.Column(Text, nullable=False)
    category = db.Column(String(50))
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(DateTime, nullable=True)  # Soft delete
    
    # Klucz obcy do projektu
    project_id = db.Column(Integer, ForeignKey('projects.id'), nullable=False)
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None

class Task(db.Model):
    __tablename__ = 'tasks'
    
    id = db.Column(Integer, primary_key=True)
    content = db.Column(Text, nullable=False)
    category = db.Column(String(50))
    priority = db.Column(String(20))  # low, medium, high
    deadline = db.Column(DateTime)
    is_completed = db.Column(Boolean, default=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    updated_at = db.Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(DateTime, nullable=True)  # Soft delete
    
    # Klucz obcy do projektu
    project_id = db.Column(Integer, ForeignKey('projects.id'), nullable=False)
    
    
    # Relacja do podzadań
    subtasks = relationship('Subtask', backref='task', lazy=True, cascade='all, delete-orphan')
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None

class Subtask(db.Model):
    __tablename__ = 'subtasks'
    
    id = db.Column(Integer, primary_key=True)
    content = db.Column(String(200), nullable=False)
    is_completed = db.Column(Boolean, default=False)
    created_at = db.Column(DateTime, default=datetime.utcnow)
    deleted_at = db.Column(DateTime, nullable=True)  # Soft delete
    
    # Klucz obcy do zadania
    task_id = db.Column(Integer, ForeignKey('tasks.id'), nullable=False)
    
    @property
    def is_deleted(self):
        return self.deleted_at is not None 